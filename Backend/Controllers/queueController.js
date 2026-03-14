import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";
import User from "../Models/User.js";
import { sendWhatsappMessage } from "../utils/sendWhatsapp.js"; 

/* -------------------------------------------------------------------------- */
/* CORE QUEUE CALCULATION LOGIC (WITH REAL-TIME SECONDS & TIMESTAMP)          */
/* -------------------------------------------------------------------------- */
const getQueueStats = async (salonId, currentUserId) => {
  // --- CHANGED START ---
  let activeTickets = await Ticket.find({ salonId, status: { $in: ["pending", "waiting", "serving"] } });

  activeTickets = activeTickets.sort((a, b) => {
    const statusPriority = { serving: 1, waiting: 2, pending: 3 };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    if (a.queueNumber !== null && b.queueNumber !== null) {
      return a.queueNumber - b.queueNumber;
    }
    
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  // --- CHANGED END ---
  
  let peopleAhead = 0;
  let waitTimeAheadMins = 0;
  const now = new Date();

  for (let i = 0; i < activeTickets.length; i++) {
    const t = activeTickets[i];
    
    if (t.userId && t.userId.toString() === currentUserId.toString()) {
      break;
    }
    
    peopleAhead++;

    if (t.status === 'serving') {
      // --- CHANGED START ---
      // Timer calculation ab actual service start time se hogi
      const startTime = t.serviceStartTime ? new Date(t.serviceStartTime) : new Date(t.updatedAt);
      const elapsedMins = (now - startTime) / (1000 * 60);
      // --- CHANGED END ---
      const remaining = Math.max(0, (t.totalTime || 0) - elapsedMins);
      waitTimeAheadMins += remaining;
    } else {
      waitTimeAheadMins += (t.totalTime || 0);
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

const broadcastQueueUpdates = async (salonId, io) => {
  // --- CHANGED START ---
  let activeTickets = await Ticket.find({ salonId, status: { $in: ["pending", "waiting", "serving"] } });

  activeTickets = activeTickets.sort((a, b) => {
    const statusPriority = { serving: 1, waiting: 2, pending: 3 };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    if (a.queueNumber !== null && b.queueNumber !== null) {
      return a.queueNumber - b.queueNumber;
    }
    
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
  // --- CHANGED END ---

  const globalWaitingCount = activeTickets.length;
  let globalEstTimeMins = 0;
  const now = new Date();
  
  for(const t of activeTickets) {
     if (t.status === 'serving') {
        // --- CHANGED START ---
        // Timer calculation ab actual service start time se hogi
        const startTime = t.serviceStartTime ? new Date(t.serviceStartTime) : new Date(t.updatedAt);
        const elapsedMins = (now - startTime) / (1000 * 60);
        // --- CHANGED END ---
        globalEstTimeMins += Math.max(0, (t.totalTime || 0) - elapsedMins);
     } else {
        globalEstTimeMins += (t.totalTime || 0);
     }
  }

  io.emit("queue_update_broadcast", {
    salonId,
    waitingCount: globalWaitingCount,
    estTime: Math.round(globalEstTimeMins)
  });

  for (const ticket of activeTickets) {
    if (ticket.userId) {
      const stats = await getQueueStats(salonId, ticket.userId);
      io.to(`user_${ticket.userId}`).emit("my_queue_update", {
        myWaitTime: stats.waitTimeAhead,
        myWaitTimeInSeconds: stats.waitTimeInSeconds,
        expectedStartTime: stats.expectedStartTime,
        myPeopleAhead: stats.peopleAhead
      });
    }
  }
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

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastTicket = await Ticket.findOne({
      salonId,
      createdAt: { $gte: startOfDay }
    }).sort({ createdAt: -1 }); 

    const queueNumber = lastTicket && lastTicket.queueNumber ? lastTicket.queueNumber + 1 : 1;

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
      const serviceNames = services.map(s => s.name).join(", ");
      const messageText = `Hello ${salon.salonName},\nYou have a new queue request from ${fullTicket.userId.name} for ${serviceNames}.\nPlease open your TrimGo dashboard to accept it.`;
      
      await sendWhatsappMessage(salon.phone, messageText);
    }
    
    // --- CHANGED START ---
    // Jab naya user queue me add ho, toh sabhi ko updated time broadcast karo taki baakiyon ko real-time wait dikhe
    await broadcastQueueUpdates(salonId, req.io);
    // --- CHANGED END ---

    res.status(201).json({ success: true, ticket });
  } catch (err) {
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

    // --- CHANGED START ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const lastTicket = await Ticket.findOne({
      salonId,
      createdAt: { $gte: startOfDay }
    }).sort({ createdAt: -1 }); 

    const nextQueueNumber = lastTicket && lastTicket.queueNumber ? lastTicket.queueNumber + 1 : 1;
    // --- CHANGED END ---

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        status: "waiting",
        // --- CHANGED START ---
        queueNumber: nextQueueNumber, 
        // --- CHANGED END ---
      },
      { new: true }
    ).populate("salonId", "salonName address");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

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

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
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

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "completed" },
      { new: true }
    );

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

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "cancelled" }, 
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
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
      { _id: ticketId, salonId },
      { status: "cancelled", chairId: null, assignedStaff: null },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
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