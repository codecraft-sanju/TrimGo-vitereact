import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";
import Ticket from "../Models/Ticket.js"; 
import User from "../Models/User.js"; 

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION CONTROLLERS (Register/Login/Logout)                         */
/* -------------------------------------------------------------------------- */

export const registerSalon = async (req, res) => {
  try {
    const { 
      salonName, ownerName, email, phone, address, zipCode, password, 
      type, latitude, longitude,
      referralCode 
    } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !zipCode || !password || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Please fill all fields and Pin your location." });
    }

    const existingSalon = await Salon.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingSalon) return res.status(400).json({ success: false, message: "Salon already registered." });

    // -------------------------------------------------------
    // Referral Logic
    // -------------------------------------------------------
    let referringUserId = null;

    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      
      if (!referrer) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Referral Code. Please check or leave empty." 
        });
      }
      referringUserId = referrer._id;
    }

    const salon = await Salon.create({
      salonName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      address,
      zipCode,
      password,
      salonType: type || "Unisex",
      latitude,
      longitude,
      isOnline: true,
      verified: false,
      services: [],
      staff: [],
      gallery: [], // Initialize empty gallery
      referredBy: referringUserId 
    });

    if (referringUserId) {
        await User.findByIdAndUpdate(referringUserId, {
            $push: { referredSalons: salon._id }
        });
    }

    req.io.emit("salon_registered", salon);

    const token = createToken(salon._id);
    res.cookie("salon_token", token, cookieOptions);

    return res.status(201).json({ success: true, message: "Salon registered successfully", salon });

  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Email or Phone already exists." });
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginSalon = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ success: false, message: "Please provide credentials." });

    const salon = await Salon.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select("+password");

    if (!salon || !(await salon.comparePassword(password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    const token = createToken(salon._id);
    res.cookie("salon_token", token, cookieOptions);

    return res.status(200).json({ success: true, message: `Welcome back, ${salon.salonName}!`, salon: salon.toJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const logoutSalon = (req, res) => {
  res.clearCookie("salon_token", cookieOptions);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

/* -------------------------------------------------------------------------- */
/* PUBLIC API: GET ALL SALONS                                                 */
/* -------------------------------------------------------------------------- */
export const getAllSalons = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = {}; 

    if (type && type !== "All") {
        query.salonType = type;
    }

    if (search) {
      query.$or = [
        { salonName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    
    // 1. Fetch Salons
    // .lean() is fast and allows us to modify the object below
    const salons = await Salon.find(query)
      .select("-password") 
      .sort({ isOnline: -1, rating: -1 })
      .lean(); 

    // 2. DYNAMIC CALCULATION LOOP
    const salonsWithData = await Promise.all(salons.map(async (salon) => {
        
        const activeTickets = await Ticket.find({
            salonId: salon._id,
            status: { $in: ["waiting", "serving"] } 
        }).select("totalTime");

        const waitingCount = activeTickets.length;
        const totalEstTime = activeTickets.reduce((sum, ticket) => sum + (ticket.totalTime || 0), 0);

        return { 
            ...salon, 
            waiting: waitingCount, 
            estTime: totalEstTime 
        };
    }));

    res.status(200).json({ 
        success: true, 
        count: salonsWithData.length, 
        salons: salonsWithData 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching salons" });
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE SALON PROFILE (UPDATED FOR GALLERY)                                 */
/* -------------------------------------------------------------------------- */
export const updateSalonProfile = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const updates = req.body; 

    // 🔥 Validation for Gallery Size (Extra Safety)
    if (updates.gallery && updates.gallery.length > 4) {
        return res.status(400).json({ success: false, message: "Maximum 4 photos allowed." });
    }

    const updatedSalon = await Salon.findByIdAndUpdate(salonId, updates, {
      new: true,
      runValidators: true,
    });
    
    // Real-time Update Broadcast
    // Isse user dashboard par status update turant dikhega
    if (updates.isOnline !== undefined) {
        req.io.emit("salon_updated", { 
            id: salonId, 
            isOnline: updatedSalon.isOnline 
        });
    }
    
    // Agar gallery update hui hai, toh pura object bhej do taaki user dashboard par photo refresh ho jaye
    if (updates.gallery) {
        req.io.emit("salon_updated", {
            id: salonId,
            gallery: updatedSalon.gallery
        });
    }

    res.status(200).json({ success: true, salon: updatedSalon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update Failed" });
  }
};