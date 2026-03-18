import mongoose from "mongoose";
// --- CHANGED START: Zod Import for Validation ---
import { z } from "zod";
// --- CHANGED END ---
import Ticket from "../Models/Ticket.js";
import Salon from "../Models/Salon.js";
import User from "../Models/User.js";
import Counter from "../Models/Counter.js";
import { sendWhatsappMessage } from "../utils/sendWhatsapp.js"; 

// --- CHANGED START: Zod Validation Schemas ---
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.number().min(0, "Price cannot be negative"),
  time: z.number().min(1, "Time must be at least 1 minute"),
  category: z.string().optional(),
});

const walkInSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  mobile: z.string().optional().or(z.literal("")),
  services: z.array(serviceSchema).min(1, "At least one service is required"),
  totalPrice: z.number().min(0, "Total price cannot be negative"),
  totalTime: z.number().min(1, "Total time must be at least 1 minute"),
  preferredStaff: z.string().nullable().optional(), // <-- NEW
});

const joinQueueSchema = z.object({
  salonId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Salon ID"),
  services: z.array(serviceSchema).min(1, "At least one service is required"),
  totalPrice: z.number().min(0, "Total price cannot be negative"),
  totalTime: z.number().min(1, "Total time must be at least 1 minute"),
  reachingTime: z.number().min(0, "Reaching time cannot be negative").optional(),
  preferredStaff: z.string().nullable().optional(), // <-- NEW
});
// --- CHANGED END ---

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
/* CORE QUEUE CALCULATION LOGIC (DUAL QUEUE SYSTEM WITH TIMESTAMP)            */
/* -------------------------------------------------------------------------- */
const getQueueStats = async (salonId, currentUserId) => {
  const activeTickets = await getSortedActiveTickets(salonId);
  const salon = await Salon.findById(salonId).select("activeChairsCount");
  
  const numChairs = Math.max(1, salon?.activeChairsCount || 1);
  let chairEndMins = Array(numChairs).fill(0); // For "Any Staff"
  
  let peopleAhead = 0;
  let waitTimeAheadMins = 0;
  const now = new Date();

  // Find current user's preference
  const userTicket = activeTickets.find(t => t.userId && t.userId.toString() === currentUserId.toString());
  const preferredStaffId = userTicket?.preferredStaff ? userTicket.preferredStaff.toString() : null;

  for (let i = 0; i < activeTickets.length; i++) {
    const t = activeTickets[i];
    
    if (t.userId && t.userId.toString() === currentUserId.toString()) {
      if (!preferredStaffId) {
        chairEndMins.sort((a, b) => a - b);
        waitTimeAheadMins = chairEndMins[0];
      }
      break;
    }

    const startTime = t.serviceStartTime ? new Date(t.serviceStartTime) : new Date(t.updatedAt);
    const elapsedMins = (now - startTime) / (1000 * 60);
    const totalAllocatedTime = (t.totalTime || 0) + (t.extraTime || 0);
    const remaining = t.status === 'serving' ? Math.max(0, totalAllocatedTime - elapsedMins) : totalAllocatedTime;

    // --- CHANGED START: DUAL LOGIC ---
    if (preferredStaffId) {
      // Specific Staff Logic
      const tStaffId = t.preferredStaff ? t.preferredStaff.toString() : null;
      if (tStaffId === preferredStaffId) {
        peopleAhead++;
        waitTimeAheadMins += remaining;
      }
    } else {
      // Any Staff Logic
      if (!t.preferredStaff) { 
        peopleAhead++;
        chairEndMins.sort((a, b) => a - b);
        chairEndMins[0] += remaining;
      }
    }
    // --- CHANGED END ---
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

export const broadcastQueueUpdates = async (salonId, io) => {
  const activeTickets = await getSortedActiveTickets(salonId);
  const salon = await Salon.findById(salonId).select("activeChairsCount");
  
  const numChairs = Math.max(1, salon?.activeChairsCount || 1);
  let chairEndMins = Array(numChairs).fill(0); 
  let specificStaffEndMins = {}; 
  
  const now = new Date();
  let runningPeopleAheadAny = 0;
  let specificStaffPeopleAhead = {};

  for (const ticket of activeTickets) {
    let currentWaitTimeMins = 0;
    let currentPeopleAhead = 0;

    const startTime = ticket.serviceStartTime ? new Date(ticket.serviceStartTime) : new Date(ticket.updatedAt);
    const elapsedMins = (now - startTime) / (1000 * 60);
    const totalAllocatedTime = (ticket.totalTime || 0) + (ticket.extraTime || 0);
    const remaining = ticket.status === 'serving' ? Math.max(0, totalAllocatedTime - elapsedMins) : totalAllocatedTime;

    // --- CHANGED START: DUAL LOGIC FOR BROADCAST ---
    if (ticket.preferredStaff) {
      const sId = ticket.preferredStaff.toString();
      if (!specificStaffEndMins[sId]) specificStaffEndMins[sId] = 0;
      if (!specificStaffPeopleAhead[sId]) specificStaffPeopleAhead[sId] = 0;

      currentWaitTimeMins = specificStaffEndMins[sId];
      currentPeopleAhead = specificStaffPeopleAhead[sId];

      specificStaffEndMins[sId] += remaining;
      specificStaffPeopleAhead[sId]++;
    } else {
      chairEndMins.sort((a, b) => a - b);
      currentWaitTimeMins = chairEndMins[0];
      currentPeopleAhead = runningPeopleAheadAny;

      chairEndMins[0] += remaining;
      runningPeopleAheadAny++;
    }
    // --- CHANGED END ---

    if (ticket.userId) {
      const waitTimeInSeconds = Math.round(currentWaitTimeMins * 60);
      const expectedStartTime = new Date(now.getTime() + (waitTimeInSeconds * 1000));

      io.to(`user_${ticket.userId}`).emit("my_queue_update", {
        myWaitTime: Math.round(currentWaitTimeMins),
        myWaitTimeInSeconds: waitTimeInSeconds,
        expectedStartTime: expectedStartTime,
        myPeopleAhead: currentPeopleAhead
      });
    }
  }

  // Global Estimate Calculation
  const maxAnyStaffWait = Math.max(...chairEndMins, 0);
  const specificWaitsArray = Object.values(specificStaffEndMins);
  const maxSpecificStaffWait = specificWaitsArray.length > 0 ? Math.max(...specificWaitsArray) : 0;
  const globalEstTimeMins = activeTickets.length > 0 ? Math.max(maxAnyStaffWait, maxSpecificStaffWait) : 0;

  io.emit("queue_update_broadcast", {
    salonId,
    waitingCount: activeTickets.length,
    estTime: Math.round(globalEstTimeMins)
  });
};

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

export const addWalkInClient = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // --- CHANGED START: Validate Input using Zod ---
    const validationResult = walkInSchema.safeParse(req.body);
    if (!validationResult.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid input data", 
        errors: validationResult.error.errors 
      });
    }

    const { name, mobile, services, totalPrice, totalTime, preferredStaff } = validationResult.data;
    const salonId = req.salon._id;

    const startOfDay = getISTStartOfDay();
    const dateString = startOfDay.toISOString().split('T')[0];
    const counterId = `${salonId}_${dateString}`;

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const queueNumber = counter.seq;

    const newTicketArray = await Ticket.create([{
      salonId,
      userId: null,
      isGuest: true,
      guestName: name,
      guestMobile: mobile,
      services,
      totalPrice,
      totalTime,
      queueNumber,
      status: "waiting",
      preferredStaff: preferredStaff || null 
    }], { session });

    const newTicket = newTicketArray[0];

    await session.commitTransaction();

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    await broadcastQueueUpdates(salonId, req.io);

    res.status(201).json({ 
        success: true, 
        message: "Walk-in client added successfully", 
        ticket: newTicket 
    });

  } catch (err) {
    await session.abortTransaction();
    console.error("Walk-in Error:", err);
    res.status(500).json({ success: false, message: "Server Error adding walk-in" });
  } finally {
    session.endSession();
  }
};

export const joinQueue = async (req, res) => {
  try {
    const validationResult = joinQueueSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid input data", 
        errors: validationResult.error.errors 
      });
    }

    const { salonId, services, totalPrice, totalTime, reachingTime, preferredStaff } = validationResult.data;
    
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
      reachingTime: reachingTime || 0,
      status: "pending", 
      preferredStaff: preferredStaff || null 
    });

    const fullTicket = await Ticket.findById(ticket._id)
      .populate("userId", "name phone email");

    req.io.to(`salon_${salonId}`).emit("new_request", fullTicket);

    const salon = await Salon.findById(salonId);
    if (salon && salon.phone) {
      try {
        const serviceNames = services.map(s => s.name).join(", ");
        const messageText = `Hello ${salon.salonName},\nYou have a new queue request from ${fullTicket.userId.name} for ${serviceNames}.\nPlease open your TrimGo dashboard to accept it.`;
        
        await sendWhatsappMessage(salon.phone, messageText);
      } catch (waErr) {
        console.error(waErr);
      }
    }
    
    await broadcastQueueUpdates(salonId, req.io);

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an active ticket! Please cancel it or wait.",
      });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* SALON ACTION: ACCEPT REQUEST                                               */
/* -------------------------------------------------------------------------- */
export const acceptRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const startOfDay = getISTStartOfDay();
    const dateString = startOfDay.toISOString().split('T')[0];
    const counterId = `${salonId}_${dateString}`;

    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

    const nextQueueNumber = counter.seq;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: "pending" },
      {
        status: "waiting",
        queueNumber: nextQueueNumber, 
      },
      { new: true, session }
    ).populate("salonId", "salonName address");

    if (!ticket) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ticket not found or in invalid state" });
    }

    await session.commitTransaction();

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
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

/* -------------------------------------------------------------------------- */
/* SALON ACTION: START SERVICE (ASSIGN CHAIR)                                 */
/* -------------------------------------------------------------------------- */
export const startService = async (req, res) => {
  try {
    const { ticketId, chairId, staffName } = req.body;
    const salonId = req.salon._id;

    // --- NEW LOGIC: Find actual staff ID to fix real-time wait times ---
    const salon = await Salon.findById(salonId).select("staff");
    const actualStaff = salon.staff.find(s => s.name === staffName);
    const actualStaffId = actualStaff ? actualStaff._id : null;
    // -------------------------------------------------------------------

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting"] } },
      {
        status: "serving",
        chairId,
        assignedStaff: staffName,
        preferredStaff: actualStaffId, // <-- FIX APPLIED HERE
        serviceStartTime: new Date(),
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
export const completeService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: "serving" },
      { status: "completed" },
      { new: true, session }
    );

    if (!ticket) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Ticket not found or in invalid state" });
    }

    await Salon.findByIdAndUpdate(salonId, {
        $inc: { revenue: ticket.totalPrice } 
    }, { session });

    await session.commitTransaction();

    if(ticket.userId) {
        req.io.to(`user_${ticket.userId}`).emit("service_completed", ticket);
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    req.io.to("admin_room").emit("admin_stats_update");

    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Service Completed" });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};
export const getMyTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      userId: req.user._id,
      $or: [
        { status: { $in: ["pending", "waiting", "serving"] } },
        { status: "completed", isReviewed: false } 
      ]
    }).sort({ updatedAt: -1 }).populate("salonId", "salonName address");

    if (!ticket) {
      return res.status(200).json({ success: true, ticket: null });
    }

    if (['pending', 'waiting', 'serving'].includes(ticket.status)) {
      const stats = await getQueueStats(ticket.salonId._id, req.user._id);
      const ticketData = ticket.toObject();
      ticketData.myWaitTime = stats.waitTimeAhead;
      ticketData.myWaitTimeInSeconds = stats.waitTimeInSeconds;
      ticketData.expectedStartTime = stats.expectedStartTime;
      ticketData.myPeopleAhead = stats.peopleAhead;
      return res.status(200).json({ success: true, ticket: ticketData });
    }
    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching ticket" });
  }
};
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId };
    
    const totalTickets = await Ticket.countDocuments(query);

    const history = await Ticket.find(query)
      .populate("salonId", "salonName address") 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: history.length,
      pagination: {
        total: totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
        currentPage: page,
        limit
      },
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
export const rejectRequest = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting"] } },
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
    
    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Request rejected successfully" });

  } catch (err) {
    console.error("Reject Error:", err);
    res.status(500).json({ success: false, message: "Server Error while rejecting" });
  }
};
export const cancelServiceBySalon = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: { $in: ["pending", "waiting", "serving"] } },
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
export const getSalonData = async (req, res) => {
    try {
        const salonId = req.salon._id;
      
        const requests = await Ticket.find({ salonId, status: "pending" })
                                     .populate("userId", "name")
                                     .sort({ createdAt: 1 });
      
        const waiting = await Ticket.find({ salonId, status: "waiting" }).populate("userId", "name");
        const serving = await Ticket.find({ salonId, status: "serving" }).populate("userId", "name");
        
        const startOfDay = getISTStartOfDay();
        const completedToday = await Ticket.find({ 
            salonId, 
            status: "completed",
            updatedAt: { $gte: startOfDay } 
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

export const addServicesToTicket = async (req, res) => {
  try {
    const { ticketId, newServices, additionalPrice, additionalTime } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOne({ _id: ticketId, salonId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    ticket.services.push(...newServices);
    ticket.totalPrice += additionalPrice;
    ticket.totalTime += additionalTime;

    await ticket.save();

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    if (ticket.userId) {
      req.io.to(`user_${ticket.userId}`).emit("ticket_updated", ticket);
    }
    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Services updated", ticket });
  } catch (err) {
    console.error("Add Services Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const extendServiceTime = async (req, res) => {
  try {
    const { ticketId, extraMinutes } = req.body;
    const salonId = req.salon._id;

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, salonId, status: "serving" },
      { $inc: { extraTime: extraMinutes } },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found or not currently serving" });
    }

    req.io.to(`salon_${salonId}`).emit("queue_updated");
    await broadcastQueueUpdates(salonId, req.io);

    res.status(200).json({ success: true, message: "Time extended successfully", ticket });
  } catch (err) {
    console.error("Extend Time Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSalonHistory = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const { period, startDate, endDate, page: queryPage, limit: queryLimit } = req.query; 
    let dateFilter = {};
    const now = new Date();

    if (period === 'today') {
      const startOfDay = getISTStartOfDay();
      dateFilter = { $gte: startOfDay };
    } else if (period === 'week') {
      const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      dateFilter = { $gte: startOfWeek };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      dateFilter = { $gte: startOfMonth };
    } else if (period === 'custom' && startDate && endDate) {
      const startIST = new Date(`${startDate}T00:00:00.000+05:30`);
      const endIST = new Date(`${endDate}T23:59:59.999+05:30`);

      dateFilter = { 
        $gte: startIST, 
        $lte: endIST 
      };
    }

    const query = { salonId, status: "completed" };
    if (Object.keys(dateFilter).length > 0) {
      query.updatedAt = dateFilter; 
    }

    const page = parseInt(queryPage) || 1;
    const limit = parseInt(queryLimit) || 20;
    const skip = (page - 1) * limit;

    const statsAggregation = await Ticket.aggregate([
      { $match: query },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" }, customers: { $sum: 1 } } }
    ]);

    const stats = statsAggregation.length > 0 
      ? { revenue: statsAggregation[0].totalRevenue, customers: statsAggregation[0].customers } 
      : { revenue: 0, customers: 0 };

    const history = await Ticket.find(query)
      .populate("userId", "name phone email")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      stats,
      pagination: {
        total: stats.customers,
        totalPages: Math.ceil(stats.customers / limit),
        currentPage: page,
        limit
      },
      history
    });

  } catch (err) {
    console.error("Salon History Error:", err);
    res.status(500).json({ success: false, message: "Error fetching salon history" });
  }
};

export const dismissReviewPrompt = async (req, res) => {
  try {
    const { ticketId } = req.body;
    await Ticket.findOneAndUpdate(
      { _id: ticketId, userId: req.user._id },
      { isReviewed: true } 
    );
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Dismiss Review Error:", err);
    res.status(500).json({ success: false, message: "Error dismissing review" });
  }
};