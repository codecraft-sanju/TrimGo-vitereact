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

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      lastLogin: new Date() // Set current time on registration
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

    // 🔥 Update Last Login immediately on successful login
    user.lastLogin = new Date();
    await user.save();

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
/* GET ALL USERS (Admin Dashboard)         */
/* --------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    // Database se saare users fetch karega, password hatake, naye users pehle
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
/* 🔥 UPDATE ACTIVITY (App Ping)         🔥 */
/* --------------------------------------- */
export const updateActivity = async (req, res) => {
  try {
    // req.user.id tumhare 'verifyToken' middleware se aayega
    const userId = req.user.id; 
    
    // Sirf lastLogin update karo
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    return res.status(200).json({
      success: true,
      message: "Activity timestamp updated",
    });
  } catch (err) {
    console.error("Activity Update Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ----------------------------------------------------- */
/* 🧪 SUPER RANDOMIZER (FIXED FOR REALISTIC TIMES)       */
/* (Ye function sab users ka time alag-alag kar dega)    */
/* ----------------------------------------------------- */
export const randomizeUserActivity = async (req, res) => {
  try {
    const users = await User.find();

    const updates = users.map(async (user, index) => {
      // 60% Chance: Aaj active hai (Green Badge)
      const isToday = Math.random() > 0.4; 
      
      let fakeDate;
      const now = new Date();

      if (isToday) {
        // 🔥 CASE 1: ACTIVE TODAY
        // Abhi ke time se 5 minute se lekar 10 ghante pehle tak ka koi bhi time
        // 'index' use kiya taaki har user ka time pakka alag ho (collision avoid karne ke liye)
        const randomMinutes = Math.floor(Math.random() * 600) + (index * 5); 
        fakeDate = new Date(now.getTime() - (randomMinutes * 60 * 1000));
      } else {
        // 🔥 CASE 2: INACTIVE (Orange Badge)
        // 1 se 7 din purana koi bhi time
        const randomDays = Math.floor(Math.random() * 7) + 1;
        const randomHours = Math.floor(Math.random() * 24);
        fakeDate = new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 1000));
      }
      
      user.lastLogin = fakeDate;
      return user.save();
    });

    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: `Fixed! Randomized times for ${users.length} users with distinct timestamps.`,
    });

  } catch (error) {
    console.error("Randomize Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};