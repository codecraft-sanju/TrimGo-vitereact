import express from "express";
import {
  registerSalon,
  loginSalon,
  logoutSalon,
  getAllSalons,       
  updateSalonProfile  
} from "../Controllers/salonController.js";
import { protectSalon } from "../Middleware/salonMiddleware.js";

const router = express.Router();

/* =========================================
   PUBLIC ROUTES
   ========================================= */

// Register New Salon
router.post("/register", registerSalon);

// Login Salon
router.post("/login", loginSalon);

// Logout Salon
router.post("/logout", logoutSalon);

// GET All Salons (Map & Filters)
router.get("/all", getAllSalons); 


/* =========================================
   PROTECTED ROUTES (Requires Salon Login)
   ========================================= */

// Get Current Salon Profile
router.get("/me", protectSalon, (req, res) => {
    return res.status(200).json({
        success: true,
        salon: req.salon
    });
});

// Update Profile (Services, Gallery, Status etc.)
router.put("/update", protectSalon, updateSalonProfile);

export default router;