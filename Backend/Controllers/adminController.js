import User from "../Models/User.js";
import Salon from "../Models/Salon.js";
import Ticket from "../Models/Ticket.js";

/* -------------------------------------------------------------------------- */
/* GET ADMIN DASHBOARD STATS                                                 */
/* -------------------------------------------------------------------------- */
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalUsers = await User.countDocuments();
    const totalSalons = await Salon.countDocuments();
    
    // 2. Calculate Total Revenue (Sum of completed tickets)
    // Hum Ticket collection se calculate karenge taaki real-time data mile
    const revenueStats = await Ticket.aggregate([
      { $match: { status: "completed" } }, // Sirf completed services
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    
    // Agar koi revenue nahi hai to 0
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // 3. Recent Live Activity (Last 5 tickets updates)
    const recentActivity = await Ticket.find()
      .sort({ updatedAt: -1 }) // Latest first
      .limit(5)
      .populate("userId", "name") // User ka naam chahiye
      .populate("salonId", "salonName"); // Salon ka naam chahiye

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        salons: totalSalons,
        revenue: totalRevenue,
      },
      activity: recentActivity
    });

  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id; 
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await user.deleteOne(); 

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (err) {
        console.error("Delete User Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error while deleting user",
        });
    }
};


/* -------------------------------------------------------------------------- */
/* ACTION: VERIFY / BAN SALON                                                */
/* -------------------------------------------------------------------------- */
export const toggleSalonStatus = async (req, res) => {
  try {
    const { id } = req.params; // Salon ID URL se aayega
    const { verified } = req.body; // true (Verify) or false (Ban/Unverify)

    const salon = await Salon.findByIdAndUpdate(
      id,
      { verified },
      { new: true }
    );

    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    // Optional: Notify Salon via Socket that they are verified/banned
    // req.io.to(`salon_${id}`).emit("admin_notification", { message: "Your account status updated." });

    res.status(200).json({ 
        success: true, 
        message: verified ? "Salon Verified Successfully" : "Salon Access Revoked",
        salon 
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Action Failed" });
  }
};

/* -------------------------------------------------------------------------- */
/* ACTION: DELETE SALON (Permanent)                                          */
/* -------------------------------------------------------------------------- */
export const deleteSalon = async (req, res) => {
    try {
      const { id } = req.params;
      
      await Salon.findByIdAndDelete(id);
      
      // Optional: Delete related tickets too to clean DB
      // await Ticket.deleteMany({ salonId: id });
  
      res.status(200).json({ success: true, message: "Salon Deleted Permanently" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Delete Failed" });
    }
  };