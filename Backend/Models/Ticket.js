import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      {
        name: String,
        price: Number,
        time: Number, // Estimated time in minutes
        category: String
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalTime: {
      type: Number,
      required: true, // Total estimated duration
    },
    queueNumber: {
      type: Number,
      default: null, // Position in line (e.g., 5th person)
    },
    // Status Flow: 
    // pending (User requested) -> waiting (Salon accepted) -> serving (In chair) -> completed (Done)
    status: {
      type: String,
      enum: ["pending", "waiting", "serving", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    assignedStaff: {
      type: String,
      default: null, // Name of the barber serving this ticket
    },
    chairId: {
      type: Number,
      default: null, // ID of the chair being used
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;