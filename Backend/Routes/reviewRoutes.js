import express from "express";
import { addReview, getSalonReviews } from "../Controllers/reviewController.js";
import { protect } from "../Middleware/authMiddleware.js"; 

const router = express.Router();

// 1. Add a new review (Protected route: Sirf logged-in user review de sakta hai)
router.post("/add", protect, addReview);

// 2. Get reviews for a specific salon (Public route: Koi bhi reviews dekh sakta hai)
router.get("/salon/:salonId", getSalonReviews);


export default router;