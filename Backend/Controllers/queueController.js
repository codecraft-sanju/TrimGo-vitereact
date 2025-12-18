import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";
import User from "../Models/User.js";

/* -------------------------------------------------------------------------- */
/* USER ACTION: JOIN QUEUE                                                   */
/* -------------------------------------------------------------------------- */
export const joinQueue = async (req, res) => {
  try {
    const { salonId, services, totalPrice, totalTime } = req.body;
    const userId = req.user._id; // Auth Middleware se aayega

    // 1. Check if user is already in a queue (active ticket)
    const existingTicket = await Ticket.findOne({
      userId,
      status: { $in: ["pending", "waiting", "serving"] },
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: "You already have an active ticket! Please cancel it or wait.",
      });
    }

    // 2. Create Ticket
    const ticket = await Ticket.create({
      salonId,
      userId,
      services,
      totalPrice,
      totalTime,
      status: "pending", // Shuru mein pending rahega
    });

    // 3. Populate User Data for Salon Dashboard
    const fullTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name phone email");

    // 🔥 SOCKET EMIT: Salon ke Dashboard par turant request dikhao
    // Room Name: "salon_{salonId}"
    req.io.to(`salon_${salonId}`).emit("new_request", fullTicket);

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: ACCEPT REQUEST                                              */
/* -------------------------------------------------------------------------- */
export const acceptRequest = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    // 1. Calculate Queue Position (Kitne log already waiting hain)
    const waitingCount = await Ticket.countDocuments({
      salonId,
      status: "waiting",
    });

    // 2. Update Ticket Status
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        status: "waiting",
        queueNumber: waitingCount + 1, // Assign token number
      },
      { new: true }
    ).populate("salonId", "salonName address");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 🔥 SOCKET EMIT: User ko batao ki request accept ho gayi
    // Room Name: "user_{userId}"
    req.io.to(`user_${ticket.userId._id}`).emit("request_accepted", ticket);
    
    // 🔥 SOCKET EMIT: Salon Dashboard refresh karo (Requests -> Waiting move)
    req.io.to(`salon_${salonId}`).emit("queue_updated");

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: START SERVICE (ASSIGN CHAIR)                                */
/* -------------------------------------------------------------------------- */
export const startService = async (req, res) => {
  try {
    const { ticketId, chairId, staffName } = req.body;
    const salonId = req.salon._id;

    // Update Ticket
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        status: "serving",
        chairId,
        assignedStaff: staffName,
      },
      { new: true }
    );

    // 🔥 SOCKET EMIT: User ko status change dikhao
    req.io.to(`user_${ticket.userId}`).emit("status_change", { 
        status: "serving", 
        chairId, 
        staffName 
    });

    // 🔥 SOCKET EMIT: Salon Dashboard refresh
    req.io.to(`salon_${salonId}`).emit("queue_updated");

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: COMPLETE SERVICE                                            */
/* -------------------------------------------------------------------------- */
export const completeService = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    // 1. Mark Ticket Completed
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "completed" },
      { new: true }
    );

    // 2. Update Salon Revenue (Virtual Calculation or Field Update)
    // Optional: Aap Salon Model me totalRevenue field bada sakte hain yahan
    await Salon.findByIdAndUpdate(salonId, {
        $inc: { revenue: ticket.totalPrice, reviewsCount: 1 } // Increment revenue
    });

    // 🔥 SOCKET EMIT: User ko Rate karne ke liye bolo
    req.io.to(`user_${ticket.userId}`).emit("service_completed", ticket);

    // 🔥 SOCKET EMIT: Salon Dashboard refresh (Serving -> Completed)
    req.io.to(`salon_${salonId}`).emit("queue_updated");
    
    // 🔥 SOCKET EMIT: Admin Dashboard (Live Revenue Update)
    req.io.to("admin_room").emit("admin_stats_update");

    res.status(200).json({ success: true, message: "Service Completed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* USER HELPER: GET MY ACTIVE TICKET (For Dashboard Load)                    */
/* -------------------------------------------------------------------------- */
export const getMyTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      userId: req.user._id,
      status: { $in: ["pending", "waiting", "serving"] },
    }).populate("salonId", "salonName address");

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching ticket" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON HELPER: GET DASHBOARD DATA (Initial Load)                           */
/* -------------------------------------------------------------------------- */
export const getSalonData = async (req, res) => {
    try {
        const salonId = req.salon._id;
        
        // Fetch lists for columns
        const requests = await Ticket.find({ salonId, status: "pending" }).populate("userId", "name");
        const waiting = await Ticket.find({ salonId, status: "waiting" }).populate("userId", "name");
        const serving = await Ticket.find({ salonId, status: "serving" }).populate("userId", "name");
        
        // Today's Stats Calculation
        const completedToday = await Ticket.find({ 
            salonId, 
            status: "completed",
            updatedAt: { $gte: new Date().setHours(0,0,0,0) } 
        });

        const todayRevenue = completedToday.reduce((acc, curr) => acc + curr.totalPrice, 0);

        res.status(200).json({ 
            success: true, 
            requests, 
            waiting, 
            serving,
            stats: {
                revenue: todayRevenue,
                customers: completedToday.length
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching data" });
    }
}