import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: "none", 
  maxAge: 7 * 24 * 60 * 60 * 1000, 
};

// Helper function to get today's date string (YYYY-MM-DD)
const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
};

/* --------------------------------------- */
/* Register User                           */
/* --------------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields (Name, Email, Phone, Password)",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this Email or Phone",
      });
    }

    // New user create karte waqt aaj ki date activeDates me daal do
    const today = getTodayDateString();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      lastActiveAt: new Date(),
      activeDates: [today] // First day attendance marked automatically
    });

    const token = createToken(user._id);

    res.cookie("auth_token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user, 
    });

  } catch (err) {
    console.error("Register Error:", err);

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
        });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/* --------------------------------------- */
/* Login User                              */
/* --------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide Email/Phone and Password",
      });
    }

    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials (User not found)",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials (Wrong password)",
      });
    }

    // --- TRACKING LOGIC START ---
    const today = getTodayDateString();
    
    // 1. Update Last Active Time (Just now)
    user.lastActiveAt = new Date();

    // 2. Attendance Check: Agar aaj ki date list me nahi hai, toh add karo
    // Hum initialize karte hai activeDates agar undefined ho (purane users ke liye)
    if (!user.activeDates) user.activeDates = [];
    
    if (!user.activeDates.includes(today)) {
        user.activeDates.push(today);
    }

    await user.save({ validateBeforeSave: false }); 
    // --- TRACKING LOGIC END ---

    const token = createToken(user._id);

    res.cookie("auth_token", token, cookieOptions);

    const userData = user.toJSON();

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: userData,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

/* --------------------------------------- */
/* Logout User                             */
/* --------------------------------------- */
export const logoutUser = (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true, 
    sameSite: "none",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/* --------------------------------------- */
/* GET ALL USERS (Admin)                   */
/* --------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    // lastActiveAt aur activeDates dono return honge
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error("Fetch Users Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* --------------------------------------- */
/* TRACK ACTIVITY (Background Sync)        */
/* --------------------------------------- */
export const trackUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // 1. Time Update
    user.lastActiveAt = new Date();

    // 2. Attendance Update (Agar aaj ka din missing hai toh add karo)
    if (!user.activeDates) user.activeDates = [];

    if (!user.activeDates.includes(today)) {
        user.activeDates.push(today);
    }

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Activity tracked",
    });
  } catch (err) {
    console.error("Activity Track Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

/* --------------------------------------- */
/* RESET LOGS (For Testing Only)           */
/* --------------------------------------- */
// Isse call karke purana data saaf kar sakte ho testing start karne se pehle
export const resetActivityLogs = async (req, res) => {
    try {
      await User.updateMany({}, { 
          $unset: { lastActiveAt: 1 },
          $set: { activeDates: [] }
      });
      res.json({ success: true, message: "Tracking Data Reset Successfully!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};