// Middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// ❌ DELETED LINE 5: const JWT_SECRET = process.env.JWT_SECRET; 
// We do not read the secret here because the .env file hasn't loaded yet.

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // 1. Get token from cookie
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // 2. ✅ READ SECRET HERE (Inside the function)
    // Now the .env file is loaded, so this will work.
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("CRITICAL: JWT_SECRET is missing in .env");
        return res.status(500).json({ success: false, message: "Server Config Error" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};