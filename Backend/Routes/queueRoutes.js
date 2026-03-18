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
    cancelServiceBySalon,
    addServicesToTicket,
    extendServiceTime,
    getSalonHistory ,
    dismissReviewPrompt
} from "../Controllers/queueController.js";
import { protect } from "../Middleware/authMiddleware.js"; 
import { protectSalon } from "../Middleware/salonMiddleware.js"; 

const router = express.Router();
router.post("/join", protect, joinQueue);
router.get("/my-ticket", protect, getMyTicket);
router.get("/history", protect, getUserHistory);
router.get("/salon-dashboard", protectSalon, getSalonData);
router.get("/salon-history-data", protectSalon, getSalonHistory);
router.post("/accept", protectSalon, acceptRequest);
router.post("/cancel-service", protectSalon, cancelServiceBySalon);
router.post("/reject", protectSalon, rejectRequest); 
router.post("/cancel", protect, cancelTicket);
router.post("/start", protectSalon, startService);
router.post("/complete", protectSalon, completeService);
router.post("/add-walkin", protectSalon, addWalkInClient);
router.post("/add-services", protectSalon, addServicesToTicket);
router.post("/extend-time", protectSalon, extendServiceTime);
router.post("/dismiss-review", protect, dismissReviewPrompt);

export default router;