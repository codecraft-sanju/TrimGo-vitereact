import express from "express";
import { 
    joinQueue, 
    acceptRequest, 
    startService, 
    completeService,
    getMyTicket,
    getSalonData
} from "../Controllers/queueController.js";

// Middleware Imports (Security ke liye)
import { protect } from "../Middleware/authMiddleware.js"; // Sirf logged-in Users ke liye
import { protectSalon } from "../Middleware/salonMiddleware.js"; // Sirf logged-in Salons ke liye

const router = express.Router();

/* =========================================
   USER ROUTES (Customer Side)
   Base URL: /api/queue
   ========================================= */

// 1. Join Queue (User request bhejega)
// Protected: User login hona zaroori hai
router.post("/join", protect, joinQueue);

// 2. Check Active Ticket (User dashboard load hone par check karega)
// Protected: User login hona zaroori hai
router.get("/my-ticket", protect, getMyTicket);


/* =========================================
   SALON ROUTES (Business Side)
   Base URL: /api/queue
   ========================================= */

// 3. Get Dashboard Data (Salon login hone par initial data load karega)
// Protected: Salon login hona zaroori hai
router.get("/salon-dashboard", protectSalon, getSalonData);

// 4. Accept Request (Pending -> Waiting)
router.post("/accept", protectSalon, acceptRequest);

// 5. Start Service (Waiting -> Serving + Chair Assignment)
router.post("/start", protectSalon, startService);

// 6. Complete Service (Serving -> Completed + Payment/Rating trigger)
router.post("/complete", protectSalon, completeService);

export default router;