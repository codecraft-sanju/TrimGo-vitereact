import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";

export const protectSalon = async (req, res, next) => {
  try {
    let token = null;

    // Check for 'salon_token' cookie
    if (req.cookies && req.cookies.salon_token) {
      token = req.cookies.salon_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized as Salon, no token",
      });
    }

    const secret = process.env.JWT_SECRET;
    
    // Verify token
    const decoded = jwt.verify(token, secret);

    // Find Salon in DB
    const salon = await Salon.findById(decoded.id);

    if (!salon) {
      return res.status(401).json({
        success: false,
        message: "Salon account not found",
      });
    }

    req.salon = salon; // Attach salon object to request
    next();
  } catch (err) {
    console.error("Salon Auth middleware error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized as Salon",
    });
  }
};