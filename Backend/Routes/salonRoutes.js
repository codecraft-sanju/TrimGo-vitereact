import express from "express";
import {
  registerSalon,
  // CHANGED START
  verifySalonRegistrationOtp,
  // CHANGED END
  loginSalon,
  logoutSalon,
  getAllSalons,       
  updateSalonProfile  , updateActiveChairs,
  editStaff, deleteStaff
} from "../Controllers/salonController.js";
import { protectSalon } from "../Middleware/salonMiddleware.js";

const router = express.Router();

// Register New Salon
router.post("/register", registerSalon);

// CHANGED START
// Verify Salon OTP
router.post("/verify-otp", verifySalonRegistrationOtp);
// CHANGED END

// Login Salon
router.post("/login", loginSalon);

router.post("/logout", logoutSalon);


router.get("/all", getAllSalons); 
router.put("/staff/edit", protectSalon, editStaff); 
router.delete("/staff/:staffId", protectSalon, deleteStaff);


// Get Current Salon Profile
router.get("/me", protectSalon, (req, res) => {
    return res.status(200).json({
        success: true,
        salon: req.salon
    });
});

// Update Profile (Add Services, Toggle Online/Offline, etc.)
router.put("/update", protectSalon, updateSalonProfile);
// Route to update active chairs count from dashboard
router.put("/update-chairs", protectSalon, updateActiveChairs);

export default router;