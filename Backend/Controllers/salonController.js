import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: false, 
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const registerSalon = async (req, res) => {
  try {
    const { salonName, ownerName, email, phone, address, zipCode, password } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !zipCode || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields (Salon Name, Owner, Email, Phone, Address, Zip, Password)",
      });
    }

    const existingSalon = await Salon.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingSalon) {
      return res.status(400).json({
        success: false,
        message: "Salon already registered with this Email or Phone",
      });
    }

    const salon = await Salon.create({
      salonName,
      ownerName,
      email: email.toLowerCase(),
      phone,
      address,
      zipCode,
      password,
    });

    const token = createToken(salon._id);

    res.cookie("salon_token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      message: "Salon registered successfully",
      salon,
    });

  } catch (err) {
    console.error("Salon Register Error:", err);
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


export const loginSalon = async (req, res) => {
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

    const salon = await Salon.findOne(query).select("+password");

    if (!salon) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials (Salon not found)",
      });
    }

    const isMatch = await salon.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials (Wrong password)",
      });
    }

    const token = createToken(salon._id);

    res.cookie("salon_token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${salon.salonName}!`,
      salon: salon.toJSON(),
    });

  } catch (err) {
    console.error("Salon Login Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};


export const logoutSalon = (req, res) => {
  res.clearCookie("salon_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Salon Logged out successfully",
  });
};