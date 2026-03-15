import express from "express";
import { 
    getDashboardStats, 
    toggleSalonStatus, 
    deleteSalon ,
     deleteUser,
     adminLogin
   
} from "../Controllers/adminController.js";

// --- CHANGED START ---
import { protectAdmin } from "../Middleware/adminMiddleware.js";
// --- CHANGED END ---

const router = express.Router();



// 1. Get Dashboard Stats (Revenue, Users, Salons, Live Activity)
// --- CHANGED START ---
router.get("/dashboard", protectAdmin, getDashboardStats);
router.post("/login", adminLogin);


// URL Example: /api/admin/verify/65a123...
router.put("/verify/:id", protectAdmin, toggleSalonStatus);

// 3. Delete Salon Permanently
router.delete("/delete/:id", protectAdmin, deleteSalon);
router.delete("/delete-user/:id", protectAdmin, deleteUser);
// --- CHANGED END ---

export default router;