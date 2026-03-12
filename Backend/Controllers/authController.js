import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { sendWhatsappMessage } from "../utils/sendWhatsapp.js";

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

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields (Name, Email, Phone, Password)",
      });
    }

    let user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already exists and is verified. Please login.",
      });
    }

    const isOtpEnabled = process.env.OTP_SERVICE_ENABLED === "true";

    if (isOtpEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

      if (user && !user.isVerified) {
        user.name = name;
        user.email = email.toLowerCase();
        user.password = password; 
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          password,
          otp,
          otpExpiry,
          isVerified: false
        });
      }

      const whatsappMsg = `Hi ${name}, your verification code for TrimGo is ${otp}. It is valid for 10 minutes.`;
      await sendWhatsappMessage(phone, whatsappMsg);

      return res.status(200).json({
        success: true,
        message: "OTP sent to your WhatsApp number successfully",
        phone: user.phone 
      });

    } else {
      
      if (user && !user.isVerified) {
        user.name = name;
        user.email = email.toLowerCase();
        user.password = password;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
      } else {
        user = await User.create({
          name,
          email: email.toLowerCase(),
          phone,
          password,
          isVerified: true 
        });
      }

      const token = createToken(user._id);
      res.cookie("auth_token", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: user.toJSON(),
      });
    }

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

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    const user = await User.findOne({ phone }).select("+otp +otpExpiry");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = createToken(user._id);
    res.cookie("auth_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Registration successful! Welcome to TrimGo.",
      user: user.toJSON(),
    });

  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error during verification",
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

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified. Please verify your phone number first.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials (Wrong password)",
      });
    }

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
/* GET ALL USERS (New for Admin)           */
/* --------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
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