import express from "express";
import { 
    getDashboardStats, 
    toggleSalonStatus, 
    deleteSalon ,
     deleteUser,
     adminLogin
   
} from "../Controllers/adminController.js";


const router = express.Router();



// 1. Get Dashboard Stats (Revenue, Users, Salons, Live Activity)
router.get("/dashboard", getDashboardStats);
router.post("/login", adminLogin);


// URL Example: /api/admin/verify/65a123...
router.put("/verify/:id", toggleSalonStatus);

// 3. Delete Salon Permanently
router.delete("/delete/:id", deleteSalon);
router.delete("/delete-user/:id", deleteUser);

export default router;