import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    
    // --- CHANGE 1: User ID ko Optional banaya --
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

    // --- CHANGED START: Added extraTime for dynamic duration ---
    extraTime: {
      type: Number,
      default: 0,
    },
    // --- CHANGED END ---

    // CHANGED START: Added reaching time and service start time
    reachingTime: {
      type: Number,
      default: 0, 
    },
    serviceStartTime: {
      type: Date,
      default: null, 
    },
    // CHANGED END

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

    // --- NEW: REVIEW SYSTEM FIELD ---
    isReviewed: {
      type: Boolean,
      default: false,
    },
    // --- NEW FIELD END ---
  },
  { timestamps: true }
);

// --- NEW FIX: RACE CONDITION / TOCTOU FIX ---
// Ye MongoDB level par block karega ki ek user ek time par multiple tickets na bana paye
ticketSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "waiting", "serving"] },
      userId: { $type: "objectId" } // Ensure userId is present and is an actual ID (ignores Walk-ins)
    }
  }
);
// --- NEW FIX END ---

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;