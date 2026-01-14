import express from "express";
import { 
    joinQueue, 
    acceptRequest, 
    startService, 
    completeService,
    getMyTicket,
    getSalonData,
    getUserHistory,
    addWalkInClient,
    rejectRequest,
    cancelTicket,
    // 🔥 NEW IMPORTS ADDED HERE
    extendServiceTime,
    markNoShow
} from "../Controllers/queueController.js";

// Middleware Imports
import { protect } from "../Middleware/authMiddleware.js"; // Logged-in Users ke liye
import { protectSalon } from "../Middleware/salonMiddleware.js"; // Logged-in Salons ke liye

const router = express.Router();

/* ==========================
   USER ROUTES
   ========================== */

// 1. Join Queue (User request bhejega)
router.post("/join", protect, joinQueue);

// 2. Check Active Ticket (User dashboard load hone par)
router.get("/my-ticket", protect, getMyTicket);

// 3. Get Booking History (Profile Page)
router.get("/history", protect, getUserHistory);

// 4. Cancel Ticket (User khud cancel kare)
router.post("/cancel", protect, cancelTicket);


/* ==========================
   SALON ROUTES (Barber Actions)
   ========================== */

// 5. Get Dashboard Data (Initial Load)
router.get("/salon-dashboard", protectSalon, getSalonData);

// 6. Accept Request (Pending -> Waiting)
router.post("/accept", protectSalon, acceptRequest);

// 7. Reject Request (Pending -> Cancelled)
router.post("/reject", protectSalon, rejectRequest); 

// 8. Start Service (Waiting -> Serving + Chair Assignment)
router.post("/start", protectSalon, startService);

// 9. Complete Service (Serving -> Completed + Revenue Update)
router.post("/complete", protectSalon, completeService);

// 10. Add Walk-in Client (Offline User)
router.post("/add-walkin", protectSalon, addWalkInClient);

// 🔥 NEW ROUTES FOR TIME DRIFT 🔥

// 11. Extend Service Time (Jab barber ko aur time chahiye)
router.post("/extend", protectSalon, extendServiceTime);

// 12. Mark No-Show (Jab customer bhaag jaye)
router.post("/no-show", protectSalon, markNoShow);

export default router;