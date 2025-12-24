import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";
import Ticket from "../Models/Ticket.js"; 
import User from "../Models/User.js"; // 1. User Model import kiya (Referral ke liye)

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
      referralCode // 2. Frontend se Referral Code receive kiya
    } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !zipCode || !password || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Please fill all fields and Pin your location." });
    }

    const existingSalon = await Salon.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingSalon) return res.status(400).json({ success: false, message: "Salon already registered." });

    // -------------------------------------------------------
    // 3. Referral Logic Start
    // -------------------------------------------------------
    let referringUserId = null;

    if (referralCode) {
      // Check agar code valid hai
      const referrer = await User.findOne({ referralCode });
      
      if (!referrer) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Referral Code. Please check or leave empty." 
        });
      }
      referringUserId = referrer._id;
    }
    // -------------------------------------------------------
    // Referral Logic End
    // -------------------------------------------------------

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
      referredBy: referringUserId // 4. Salon model me ID save ki
    });

    // 5. Agar referral tha, to User (Agent) ki list update karo
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
/* PUBLIC API: GET ALL SALONS (DYNAMIC TIME CALCULATION ADDED)                */
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
    const salons = await Salon.find(query)
      .select("-password")
      .sort({ isOnline: -1, rating: -1 })
      .lean(); 

    // 🔥 2. DYNAMIC CALCULATION LOOP
    const salonsWithData = await Promise.all(salons.map(async (salon) => {
        
        // Active tickets dhundo (Waiting + Serving)
        // Sirf 'totalTime' field laao taaki database fast rahe
        const activeTickets = await Ticket.find({
            salonId: salon._id,
            status: { $in: ["waiting", "serving"] } 
        }).select("totalTime");

        // A. Waiting Count (Kitne log hain)
        const waitingCount = activeTickets.length;

        // B. Total Estimated Time (Sabka time jodkar)
        // Reduce function use karke saare tickets ka time sum kar rahe hain
        const totalEstTime = activeTickets.reduce((sum, ticket) => sum + (ticket.totalTime || 0), 0);

        // Salon object mein dono cheezein add kar do
        return { 
            ...salon, 
            waiting: waitingCount, 
            estTime: totalEstTime // 🔥 Ab ye Real Time (mins) frontend par jayega
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


export const updateSalonProfile = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const updates = req.body; 

    const updatedSalon = await Salon.findByIdAndUpdate(salonId, updates, {
      new: true,
      runValidators: true,
    });
    
    if (updates.isOnline !== undefined) {
        req.io.emit("salon_updated", { 
            id: salonId, 
            isOnline: updatedSalon.isOnline 
        });
    }

    res.status(200).json({ success: true, salon: updatedSalon });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update Failed" });
  }
};