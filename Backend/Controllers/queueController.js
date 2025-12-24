import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";
import User from "../Models/User.js";

/* -------------------------------------------------------------------------- */
/* USER ACTION: JOIN QUEUE                                                    */
/* -------------------------------------------------------------------------- */
export const joinQueue = async (req, res) => {
  try {
    const { salonId, services, totalPrice, totalTime } = req.body;
    const userId = req.user._id; 

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
      status: "pending", 
    });

    // 3. Populate User Data for Salon Dashboard
    const fullTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name phone email");

    // 🔥 SOCKET EMIT: Salon ke Dashboard par turant request dikhao
    req.io.to(`salon_${salonId}`).emit("new_request", fullTicket);

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: ACCEPT REQUEST (DYNAMIC TIME UPDATE HERE)                    */
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
        queueNumber: waitingCount + 1, 
      },
      { new: true }
    ).populate("salonId", "salonName address");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // 🔥 SOCKET EMIT: User ko batao ki request accept ho gayi
    req.io.to(`user_${ticket.userId._id}`).emit("request_accepted", ticket);
    
    // 🔥 SOCKET EMIT: Salon Dashboard refresh karo
    req.io.to(`salon_${salonId}`).emit("queue_updated");

    // 🔥 NEW: Calculate Dynamic Time for Broadcast
    // Active tickets nikalo (Waiting + Serving)
    const activeTickets = await Ticket.find({
        salonId,
        status: { $in: ["waiting", "serving"] }
    }).select("totalTime");

    const currentWaitingCount = activeTickets.length;
    // Saare tickets ka time jod lo (Sum)
    const currentEstTime = activeTickets.reduce((sum, t) => sum + (t.totalTime || 0), 0);

    // Broadcast both Count AND Time
    req.io.emit("queue_update_broadcast", { 
        salonId, 
        waitingCount: currentWaitingCount,
        estTime: currentEstTime // 🔥 Real-time calculated time
    });

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: START SERVICE (ASSIGN CHAIR)                                 */
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
/* SALON ACTION: COMPLETE SERVICE (DYNAMIC TIME UPDATE HERE)                  */
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

    // 2. Update Salon Revenue
    await Salon.findByIdAndUpdate(salonId, {
        $inc: { revenue: ticket.totalPrice, reviewsCount: 1 } 
    });

    // 🔥 SOCKET EMIT: User ko Rate karne ke liye bolo
    req.io.to(`user_${ticket.userId}`).emit("service_completed", ticket);

    // 🔥 SOCKET EMIT: Salon Dashboard refresh
    req.io.to(`salon_${salonId}`).emit("queue_updated");
    
    // 🔥 SOCKET EMIT: Admin Dashboard
    req.io.to("admin_room").emit("admin_stats_update");

    // 🔥 NEW: Calculate Dynamic Time for Broadcast (Kam ho gaya hoga time)
    const activeTickets = await Ticket.find({
        salonId,
        status: { $in: ["waiting", "serving"] }
    }).select("totalTime");

    const currentWaitingCount = activeTickets.length;
    const currentEstTime = activeTickets.reduce((sum, t) => sum + (t.totalTime || 0), 0);

    req.io.emit("queue_update_broadcast", { 
        salonId, 
        waitingCount: currentWaitingCount,
        estTime: currentEstTime // 🔥 Updated time broadcast
    });

    res.status(200).json({ success: true, message: "Service Completed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* USER HELPER: GET MY ACTIVE TICKET (For Dashboard Load)                     */
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
/* SALON HELPER: GET DASHBOARD DATA (Initial Load)                            */
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

/* -------------------------------------------------------------------------- */
/* USER ACTION: GET BOOKING HISTORY (FOR PROFILE PAGE)                        */
/* -------------------------------------------------------------------------- */
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Auth middleware se user ID mili

    // Database mein user ki tickets dhundo aur sort karo (Latest pehle)
    const history = await Ticket.find({ userId })
      .populate("salonId", "salonName address") // Salon ka naam aur address join kiya
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: history.length,
      history, // Frontend par ye array jayega
    });

  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ 
        success: false, 
        message: "Server Error while fetching history" 
    });
  }
};