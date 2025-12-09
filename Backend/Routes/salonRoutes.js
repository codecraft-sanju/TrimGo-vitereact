import express from "express";
import {
  registerSalon,
  loginSalon,
  logoutSalon,
} from "../Controllers/salonController.js";
import { protectSalon } from "../Middleware/salonMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerSalon);
router.post("/login", loginSalon);
router.post("/logout", logoutSalon);

// Protected Route (Requires Login)
// Example: Get current logged in Salon details
router.get("/me", protectSalon, (req, res) => {
    return res.status(200).json({
        success: true,
        salon: req.salon
    });
});

export default router;