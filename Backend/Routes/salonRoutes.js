import express from "express";
import {
  registerSalon,
  // CHANGED START
  verifySalonRegistrationOtp,
  // CHANGED END
  loginSalon,
  logoutSalon,
  getAllSalons,       // <-- New Import
  updateSalonProfile  // <-- New Import
} from "../Controllers/salonController.js";
import { protectSalon } from "../Middleware/salonMiddleware.js";

const router = express.Router();

/* =========================================
   PUBLIC ROUTES
   ========================================= */

// Register New Salon
router.post("/register", registerSalon);

// CHANGED START
// Verify Salon OTP
router.post("/verify-otp", verifySalonRegistrationOtp);
// CHANGED END

// Login Salon
router.post("/login", loginSalon);

// Logout Salon
router.post("/logout", logoutSalon);

// GET All Salons (For User Map & Search Filters)
// User bina login kiye bhi salons dekh sakta hai, isliye public rakha hai
router.get("/all", getAllSalons); 




// Get Current Salon Profile
router.get("/me", protectSalon, (req, res) => {
    return res.status(200).json({
        success: true,
        salon: req.salon
    });
});

// Update Profile (Add Services, Toggle Online/Offline, etc.)
router.put("/update", protectSalon, updateSalonProfile);

export default router;