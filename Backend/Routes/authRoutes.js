// routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers, // <--- 1. Import Added
} from "../Controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

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
router.get("/all", getAllUsers); // <--- 2. Route Added

export default router;