import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";
import User from "../Models/User.js";
import Counter from "../Models/Counter.js";
import { sendWhatsappMessage } from "../utils/sendWhatsapp.js"; 

// --- FIXED TIMEZONE BUG START ---
// Helper to get the start of the current day in IST (Asia/Kolkata)
const getISTStartOfDay = () => {
  const now = new Date();
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 mins
  const istDate = new Date(now.getTime() + IST_OFFSET);
  istDate.setUTCHours(0, 0, 0, 0);
  return new Date(istDate.getTime() - IST_OFFSET);
};
// --- FIXED TIMEZONE BUG END ---

// --- NEW HELPER: Fetch and Sort Active Tickets (DRY Fix) ---
const getSortedActiveTickets = async (salonId) => {
  let activeTickets = await Ticket.find({ salonId, status: { $in: ["pending", "waiting", "serving"] } });

  return activeTickets.sort((a, b) => {
    const statusPriority = { serving: 1, waiting: 2, pending: 3 };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    if (a.queueNumber !== null && b.queueNumber !== null) {
      return a.queueNumber - b.queueNumber;
    }
    
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};
// --- NEW HELPER END ---

/* -------------------------------------------------------------------------- */
/* CORE QUEUE CALCULATION LOGIC (WITH REAL-TIME SECONDS & TIMESTAMP)          */
/* -------------------------------------------------------------------------- */
const getQueueStats = async (salonId, currentUserId) => {
  const activeTickets = await getSortedActiveTickets(salonId);
  const salon = await Salon.findById(salonId).select("activeChairsCount");
  
  // --- CHANGED START ---
  // Ab time calculate activeChairsCount par depend karega
  const numChairs = Math.max(1, salon?.activeChairsCount || 1);
  let chairEndMins = Array(numChairs).fill(0);
  // --- CHANGED END ---
  
  let peopleAhead = 0;
  let waitTimeAheadMins = 0;
  const now = new Date();

  for (let i = 0; i < activeTickets.length; i++) {
    const t = activeTickets[i];
    
    if (t.userId && t.userId.toString() === currentUserId.toString()) {
      chairEndMins.sort((a, b) => a - b);
      waitTimeAheadMins = chairEndMins[0];
      break;
    }
    
    peopleAhead++;

    chairEndMins.sort((a, b) => a - b);

    if (t.status === 'serving') {
      const startTime = t.serviceStartTime ? new Date(t.serviceStartTime) : new Date(t.updatedAt);
      const elapsedMins = (now - startTime) / (1000 * 60);
      const remaining = Math.max(0, (t.totalTime || 0) - elapsedMins);
      chairEndMins[0] = Math.max(chairEndMins[0], remaining);
    } else {
      chairEndMins[0] += (t.totalTime || 0);
    }
  }

  const waitTimeInSeconds = Math.round(waitTimeAheadMins * 60);
  const expectedStartTime = new Date(now.getTime() + (waitTimeInSeconds * 1000));

  return { 
    peopleAhead, 
    waitTimeAhead: Math.round(waitTimeAheadMins), 
    waitTimeInSeconds,
    expectedStartTime 
  };
};

// --- CHANGED START ---
// Export kar diya taaki salon controller ise use kar sake
export const broadcastQueueUpdates = async (salonId, io) => {
// --- CHANGED END ---
  const activeTickets = await getSortedActiveTickets(salonId);
  const salon = await Salon.findById(salonId).select("activeChairsCount");
  
  // --- CHANGED START ---
  // Broadcast update bhi ab activeChairsCount se chalega
  const numChairs = Math.max(1, salon?.activeChairsCount || 1);
  let chairEndMins = Array(numChairs).fill(0);
  // --- CHANGED END ---
  
  const now = new Date();
  let runningPeopleAhead = 0;

  for (const ticket of activeTickets) {
    chairEndMins.sort((a, b) => a - b);
    const currentWaitTimeMins = chairEndMins[0];

    if (ticket.userId) {
      const waitTimeInSeconds = Math.round(currentWaitTimeMins * 60);
      const expectedStartTime = new Date(now.getTime() + (waitTimeInSeconds * 1000));

      io.to(`user_${ticket.userId}`).emit("my_queue_update", {
        myWaitTime: Math.round(currentWaitTimeMins),
        myWaitTimeInSeconds: waitTimeInSeconds,
        expectedStartTime: expectedStartTime,
        myPeopleAhead: runningPeopleAhead
      });
    }

    runningPeopleAhead++;
    
    if (ticket.status === 'serving') {
      const startTime = ticket.serviceStartTime ? new Date(ticket.serviceStartTime) : new Date(ticket.updatedAt);
      const elapsedMins = (now - startTime) / (1000 * 60);
      const remaining = Math.max(0, (ticket.totalTime || 0) - elapsedMins);
      chairEndMins[0] = Math.max(chairEndMins[0], remaining);
    } else {
      chairEndMins[0] += (ticket.totalTime || 0);
    }
  }

  const globalEstTimeMins = activeTickets.length > 0 ? Math.max(...chairEndMins) : 0;

  io.emit("queue_update_broadcast", {
    salonId,
    waitingCount: activeTickets.length,
    estTime: Math.round(globalEstTimeMins)
  });
};

/* -------------------------------------------------------------------------- */
/* USER ACTION: CANCEL TICKET                                                 */
/* -------------------------------------------------------------------------- */
export const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const userId = req.user._id;

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or unauthorized" });
    }

    if (ticket.status === 'serving' || ticket.status === 'completed') {
      return res.status(400).json({ success: false, message: "Cannot cancel a ticket that is already serving or completed" });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    req.io.to(`salon_${ticket.salonId}`).emit("queue_updated");
    await broadcastQueueUpdates(ticket.salonId, req.io);

    res.status(200).json({ success: true, message: "Ticket cancelled successfully" });

  } catch (err) {
    console.error("Cancel Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION - ADD WALK-IN CLIENT (OFFLINE USER)                           */
/* -------------------------------------------------------------------------- */
export const addWalkInClient = async (req, res) => {
  try {
    const { name, mobile, services, totalPrice, totalTime } = req.body;
    const salonId = req.salon._id;

    if (!name || !services || services.length === 0) {
      return res.status(400).json({ success: false, message: "Customer Name and Services are required" });
    }

    // --- FIXED TIMEZONE BUG START ---
    const startOfDay = getISTStartOfDay();
    // --- FIXED TIMEZONE BUG END ---

    const dateString = startOfDay.toISOString().split('T')[0];
    const counterId = `${salonId}_${dateString}`;

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const queueNumber = counter.seq;

    const newTicket = await Ticket.create({
      salonId,
      userId: null,
      isGuest: true,
      guestName: name,
      guestMobile: mobile,
      services,
      totalPrice,
      totalTime,
      queueNumber,
      status: "waiting"
    });

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    await broadcastQueueUpdates(salonId, req.io);

    res.status(201).json({ 
        success: true, 
        message: "Walk-in client added successfully", 
        ticket: newTicket 
    });

  } catch (err) {
    console.error("Walk-in Error:", err);
    res.status(500).json({ success: false, message: "Server Error adding walk-in" });
  }
};

/* -------------------------------------------------------------------------- */
/* USER ACTION: JOIN QUEUE                                                    */
/* -------------------------------------------------------------------------- */
export const joinQueue = async (req, res) => {
  try {
    // --- CHANGED START ---
    // reachingTime ko add kiya body se
    const { salonId, services, totalPrice, totalTime, reachingTime } = req.body;
    // --- CHANGED END ---
    const userId = req.user._id; 

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

    const ticket = await Ticket.create({
      salonId,
      userId,
      services,
      totalPrice,
      totalTime,
      // --- CHANGED START ---
      reachingTime: reachingTime || 0,
      // --- CHANGED END ---
      status: "pending", 
    });

    const fullTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name phone email");

    req.io.to(`salon_${salonId}`).emit("new_request", fullTicket);

    const salon = await Salon.findById(salonId);
    if (salon && salon.phone) {
      // --- CHANGED START ---
      try {
        const serviceNames = services.map(s => s.name).join(", ");
        const messageText = `Hello ${salon.salonName},\nYou have a new queue request from ${fullTicket.userId.name} for ${serviceNames}.\nPlease open your TrimGo dashboard to accept it.`;
        
        await sendWhatsappMessage(salon.phone, messageText);
      } catch (waErr) {
        console.error(waErr);
      }
      // --- CHANGED END ---
    }
    
    // --- CHANGED START ---
    // Jab naya user queue me add ho, toh sabhi ko updated time broadcast karo taki baakiyon ko real-time wait dikhe
    await broadcastQueueUpdates(salonId, req.io);
    // --- CHANGED END ---

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    // --- CHANGED START: RACE CONDITION ERROR CATCH ---
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an active ticket! Please cancel it or wait.",
      });
    }
    // --- CHANGED END ---
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* SALON ACTION: ACCEPT REQUEST                                               */
/* -------------------------------------------------------------------------- */
export const acceptRequest = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    // --- FIXED TIMEZONE BUG START ---
    const startOfDay = getISTStartOfDay();
    // --- FIXED TIMEZONE BUG END ---

    const dateString = startOfDay.toISOString().split('T')[0];
    const counterId = `${salonId}_${dateString}`;

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextQueueNumber = counter.seq;

    const ticket = await Ticket.findOneAndUpdate(
      // --- CHANGED START: Added status check to prevent reviving dead tickets ---
      { _id: ticketId, salonId, status: "pending" },
      // --- CHANGED END ---
      {
        status: "waiting",
        // --- CHANGED START ---
        queueNumber: nextQueueNumber, 
        // --- CHANGED END ---
      },
      { new: true }
    ).populate("salonId", "salonName address");

    if (!ticket) return res.status(404).json({ message: "Ticket not found or in invalid state" });

    const stats = await getQueueStats(salonId, ticket.userId);
    const ticketData = ticket.toObject();
    ticketData.myWaitTime = stats.waitTimeAhead;
    ticketData.myWaitTimeInSeconds = stats.waitTimeInSeconds;
    ticketData.expectedStartTime = stats.expectedStartTime;
    ticketData.myPeopleAhead = stats.peopleAhead;

    req.io.to(`user_${ticket.userId}`).emit("request_accepted", ticketData);
    req.io.to(`salon_${salonId}`).emit("queue_updated");

    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, ticket: ticketData });
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

    const ticket = await Ticket.findOneAndUpdate(
      // --- CHANGED START: Added status check to prevent state transition bugs ---
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting"] } },
      // --- CHANGED END ---
      {
        status: "serving",
        chairId,
        assignedStaff: staffName,
        // --- CHANGED START ---
        // Service ka actual start time save karo
        serviceStartTime: new Date(),
        // --- CHANGED END ---
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found or in invalid state" });

    if(ticket.userId) {
        req.io.to(`user_${ticket.userId}`).emit("status_change", { 
            status: "serving", 
            chairId, 
            staffName 
        });
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: COMPLETE SERVICE                                             */
/* -------------------------------------------------------------------------- */
export const completeService = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      // --- CHANGED START: Added status check ---
      { _id: ticketId, salonId, status: "serving" },
      // --- CHANGED END ---
      { status: "completed" },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found or in invalid state" });

    await Salon.findByIdAndUpdate(salonId, {
        $inc: { revenue: ticket.totalPrice, reviewsCount: 1 } 
    });

    if(ticket.userId) {
        req.io.to(`user_${ticket.userId}`).emit("service_completed", ticket);
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    req.io.to("admin_room").emit("admin_stats_update");

    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Service Completed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------------------------------------------------------------------------- */
/* USER HELPER: GET MY ACTIVE TICKET                                          */
/* -------------------------------------------------------------------------- */
export const getMyTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      userId: req.user._id,
      status: { $in: ["pending", "waiting", "serving"] },
    }).populate("salonId", "salonName address");

    if (!ticket) {
      return res.status(200).json({ success: true, ticket: null });
    }

    // --- CHANGED START ---
    // Ab user ko "pending" state me bhi apna estimated time dikhega
    if (ticket.status === 'pending' || ticket.status === 'waiting' || ticket.status === 'serving') {
      const stats = await getQueueStats(ticket.salonId._id, req.user._id);
      const ticketData = ticket.toObject();
      ticketData.myWaitTime = stats.waitTimeAhead;
      ticketData.myWaitTimeInSeconds = stats.waitTimeInSeconds;
      ticketData.expectedStartTime = stats.expectedStartTime;
      ticketData.myPeopleAhead = stats.peopleAhead;
      return res.status(200).json({ success: true, ticket: ticketData });
    }
    // --- CHANGED END ---

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching ticket" });
  }
};

/* -------------------------------------------------------------------------- */
/* USER ACTION: GET BOOKING HISTORY                                           */
/* -------------------------------------------------------------------------- */
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await Ticket.find({ userId })
      .populate("salonId", "salonName address") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: history.length,
      history, 
    });

  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ 
        success: false, 
        message: "Server Error while fetching history" 
    });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION - REJECT REQUEST                                              */
/* -------------------------------------------------------------------------- */
export const rejectRequest = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      // --- CHANGED START: Added status check ---
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting"] } },
      // --- CHANGED END ---
      { status: "cancelled" }, 
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or in invalid state" });
    }

    if (ticket.userId) {
        req.io.to(`user_${ticket.userId}`).emit("request_rejected", {
            ticketId: ticket._id,
            message: "Your request was declined by the salon."
        });
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    
    // --- CHANGED START ---
    // Reject hone par bhi time update karke sabko bhejo
    await broadcastQueueUpdates(salonId, req.io);
    // --- CHANGED END ---

    res.status(200).json({ success: true, message: "Request rejected successfully" });

  } catch (err) {
    console.error("Reject Error:", err);
    res.status(500).json({ success: false, message: "Server Error while rejecting" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: CANCEL ONGOING SERVICE BY SALON                              */
/* -------------------------------------------------------------------------- */
export const cancelServiceBySalon = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      // --- CHANGED START: Added status check ---
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting", "serving"] } },
      // --- CHANGED END ---
      { status: "cancelled", chairId: null, assignedStaff: null },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or in invalid state" });
    }

    if (ticket.userId) {
      req.io.to(`user_${ticket.userId}`).emit("status_change", {
        status: "cancelled",
        chairId: null
      });
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");

    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Service cancelled successfully" });
  } catch (err) {
    console.error("Cancel Service Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* SALON HELPER: GET DASHBOARD DATA                                           */
/* -------------------------------------------------------------------------- */
export const getSalonData = async (req, res) => {
    try {
        const salonId = req.salon._id;
        
        // --- CHANGED START ---
        // Requests ki list ko createdAt ke hisab se sort kar diya taki purani request upar aaye
        const requests = await Ticket.find({ salonId, status: "pending" })
                                     .populate("userId", "name")
                                     .sort({ createdAt: 1 });
        // --- CHANGED END ---

        const waiting = await Ticket.find({ salonId, status: "waiting" }).populate("userId", "name");
        const serving = await Ticket.find({ salonId, status: "serving" }).populate("userId", "name");
        
        // --- FIXED TIMEZONE BUG START ---
        const startOfDay = getISTStartOfDay();
        const completedToday = await Ticket.find({ 
            salonId, 
            status: "completed",
            updatedAt: { $gte: startOfDay } 
        });
        // --- FIXED TIMEZONE BUG END ---

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