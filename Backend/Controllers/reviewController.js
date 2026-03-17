import mongoose from "mongoose";
import Review from "../Models/Review.js";
import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";

export const addReview = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ticketId, salonId, rating, reviewText } = req.body;
    const userId = req.user._id;

    // 1. Check if the ticket exists, belongs to user, and is completed
    const ticket = await Ticket.findOne({ _id: ticketId, userId, salonId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    if (ticket.status !== "completed") {
      return res.status(400).json({ success: false, message: "You can only review completed services." });
    }

    if (ticket.isReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this service." });
    }

    // 2. Create the Review
    const newReview = await Review.create(
      [
        {
          userId,
          salonId,
          ticketId,
          rating,
          reviewText,
        },
      ],
      { session }
    );

    // 3. Update the Ticket so user can't review again
    ticket.isReviewed = true;
    await ticket.save({ session });

    // 4. Update the Salon's Average Rating and Review Count
    const salon = await Salon.findById(salonId).session(session);
    
    const currentCount = salon.reviewsCount || 0;
    const currentRating = salon.rating || 0;

    // Formula to calculate new average rating
    const newTotalRating = (currentRating * currentCount) + Number(rating);
    const newReviewsCount = currentCount + 1;
    const newAverageRating = newTotalRating / newReviewsCount;

    salon.rating = parseFloat(newAverageRating.toFixed(1)); // 4.5 jaisa format rakhne ke liye
    salon.reviewsCount = newReviewsCount;
    await salon.save({ session });

    // Everything is successful, commit changes
    await session.commitTransaction();

    res.status(201).json({ 
      success: true, 
      message: "Review submitted successfully!", 
      review: newReview[0] 
    });

  } catch (error) {
    // Agar koi error aayi toh saare changes revert kar do
    await session.abortTransaction();
    
    // Catch duplicate error if any parallel request comes
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You have already reviewed this service." });
    }
    
    console.error("Add Review Error:", error);
    res.status(500).json({ success: false, message: "Server Error while submitting review" });
  } finally {
    session.endSession();
  }
};

// Add this at the bottom of reviewController.js

export const getSalonReviews = async (req, res) => {
  try {
    const { salonId } = req.params;
    
    // Reviews find karo aur jis user ne review diya hai uska sirf naam nikalo
    const reviews = await Review.find({ salonId })
      .populate("userId", "name") 
      .sort({ createdAt: -1 }); // Naye reviews sabse upar dikhane ke liye

    res.status(200).json({ 
      success: true, 
      count: reviews.length, 
      reviews 
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error while fetching reviews" });
  }
};