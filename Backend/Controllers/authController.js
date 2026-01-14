import jwt from "jsonwebtoken";
import User from "../Models/User.js"; // Path check kar lena aapke folder structure ke hisab se

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

    // Note: lastActiveAt automatically set hoga (Schema default ki wajah se)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
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

    // --- NEW CHANGE: Login karte waqt bhi time update karo ---
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false }); 
    // validateBeforeSave: false isliye taki baki fields check na ho, bas time update ho

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
    // lastActiveAt bhi return hoga automatic
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
/* TRACK ACTIVITY (New for Play Store)     */
/* --------------------------------------- */
// Yeh function background me call hoga jab app open hogi
export const trackUserActivity = async (req, res) => {
  try {
    // req.user hume middleware se milega (jo token check karta hai)
    // Hum seedha DB me update kar denge bina data wapas mangwaye
    await User.findByIdAndUpdate(req.user.id, { lastActiveAt: new Date() });

    return res.status(200).json({
      success: true,
      message: "Activity updated",
    });
  } catch (err) {
    // Agar fail bhi ho jaye, toh app user ko error mat dikhana, bas console log karo
    console.error("Activity Track Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};