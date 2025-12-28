import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    
    // --- CHANGE 1: User ID ko Optional banaya ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // <--- IMPORTANT: Ise FALSE karein
      default: null,
    },

    // --- CHANGE 2: Guest Details (Offline Client ke liye fields) ---
    isGuest: {
      type: Boolean,
      default: false, // Online users ke liye false, Walk-in ke liye true hoga
    },
    guestName: {
      type: String, // Yahan "Rahul", "Amit" aayega
      default: "",
    },
    guestMobile: {
      type: String, // Optional mobile number
      default: "",
    },

    services: [
      {
        name: String,
        price: Number,
        time: Number, 
        category: String
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalTime: {
      type: Number,
      required: true, 
    },
    queueNumber: {
      type: Number,
      default: null, 
    },
    status: {
      type: String,
      enum: ["pending", "waiting", "serving", "completed", "cancelled", "rejected"],
      default: "pending", // Walk-in ke liye direct 'waiting' bhi set kar sakte ho controller se
    },
    assignedStaff: {
      type: String,
      default: null, 
    },
    chairId: {
      type: Number,
      default: null, 
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;