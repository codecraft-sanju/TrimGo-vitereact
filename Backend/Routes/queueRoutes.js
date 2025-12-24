import express from "express";
import { 
    joinQueue, 
    acceptRequest, 
    startService, 
    completeService,
    getMyTicket,
    getSalonData,
    getUserHistory // 🔥 1. New Import added
} from "../Controllers/queueController.js";

// Middleware Imports (Security ke liye)
import { protect } from "../Middleware/authMiddleware.js"; // Sirf logged-in Users ke liye
import { protectSalon } from "../Middleware/salonMiddleware.js"; // Sirf logged-in Salons ke liye

const router = express.Router();

/* =========================================
   USER ROUTES (Client Side)
   Base URL: /api/queue
   ========================================= */

// 1. Join Queue (User request bhejega)
router.post("/join", protect, joinQueue);

// 2. Check Active Ticket (User dashboard load hone par check karega)
router.get("/my-ticket", protect, getMyTicket);

// 3. Get Booking History (Profile Page ke liye) 🔥 2. New Route added
router.get("/history", protect, getUserHistory);


/* =========================================
   SALON ROUTES (Business Side)
   Base URL: /api/queue
   ========================================= */

// 4. Get Dashboard Data (Salon login hone par initial data load karega)
router.get("/salon-dashboard", protectSalon, getSalonData);

// 5. Accept Request (Pending -> Waiting)
router.post("/accept", protectSalon, acceptRequest);

// 6. Start Service (Waiting -> Serving + Chair Assignment)
router.post("/start", protectSalon, startService);

// 7. Complete Service (Serving -> Completed + Payment/Rating trigger)
router.post("/complete", protectSalon, completeService);

export default router;