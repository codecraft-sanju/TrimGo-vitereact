// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers, 
  updateActivity, // <--- 1. Import Added (Activity Updater)
} from "../Controllers/authController.js";
import { protect } from "../Middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/logout
router.post("/logout", logoutUser);

// GET /api/auth/me  (current logged in user info)
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// GET /api/auth/all (Admin Route to fetch all users)
router.get("/all", getAllUsers);

// 🔥 POST /api/auth/update-activity (New: App Testing Signal)
// Isse App backend ko batayega ki user abhi active hai
router.post("/update-activity", protect, updateActivity); 

export default router;