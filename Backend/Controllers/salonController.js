import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: true, // Set to true if using HTTPS in production
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION CONTROLLERS (Register/Login/Logout)                        */
/* -------------------------------------------------------------------------- */

export const registerSalon = async (req, res) => {
  try {
    const { 
      salonName, ownerName, email, phone, address, zipCode, password, 
      type, latitude, longitude 
    } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !zipCode || !password || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Please fill all fields and Pin your location." });
    }

    const existingSalon = await Salon.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existingSalon) return res.status(400).json({ success: false, message: "Salon already registered." });

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
      // Defaults:
      isOnline: true,
      verified: false,
      services: [],
      staff: []
    });

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
/* PUBLIC API: GET ALL SALONS (For User Map & List)                          */
/* -------------------------------------------------------------------------- */
export const getAllSalons = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    // Default Filter: Show only verified salons (optional)
    // Abhi development ke liye verified check hata sakte hain agar chahiye
    let query = {}; 

    // Filter by Type (Unisex/Men/Women)
    if (type && type !== "All") {
        query.salonType = type;
    }

    // Search by Name or Area
    if (search) {
      query.$or = [
        { salonName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    
    // Fetch and Sort
    // Logic: Online salons pehle, fir Rating ke hisaab se
    const salons = await Salon.find(query)
      .select("-password")
      .sort({ isOnline: -1, rating: -1 });

    res.status(200).json({ 
        success: true, 
        count: salons.length, 
        salons 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching salons" });
  }
};


export const updateSalonProfile = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const updates = req.body; // Expects: { isOnline, services, staff, etc. }

    // Update in Database
    const updatedSalon = await Salon.findByIdAndUpdate(salonId, updates, {
      new: true,
      runValidators: true,
    });
    
    // 🔥 SOCKET EMIT: Global Map Update
    // Agar salon online/offline hota hai, toh sab users ko map par update dikhega
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