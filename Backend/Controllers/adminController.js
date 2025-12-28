import User from "../Models/User.js";
import Salon from "../Models/Salon.js";
import Ticket from "../Models/Ticket.js";


export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Server ke .env file se credentials check karein
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (username === adminUser && password === adminPass) {
      return res.status(200).json({
        success: true,
        message: "Welcome Boss! Access Granted.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials. Access Denied.",
      });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    // Basic Counts
    const totalUsers = await User.countDocuments();
    const totalSalons = await Salon.countDocuments();

    // Total Revenue Calculation
    const revenueStats = await Ticket.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    // Recent Activity (Last 5)
    // IMPORTANT: .lean() use kiya taaki query fast ho
    const recentActivity = await Ticket.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("userId", "name")
      .populate("salonId", "salonName");

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        salons: totalSalons,
        revenue: totalRevenue,
      },
      activity: recentActivity,
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 3. DELETE USER (With Cleanup)                                              */
/* -------------------------------------------------------------------------- */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Step 1: Delete User
    await user.deleteOne();

    // Step 2: CLEANUP - User ke tickets mein userId ko null kar do
    // Taaki dashboard crash na ho jab hum "recentActivity" fetch karein
    await Ticket.updateMany({ userId: userId }, { userId: null });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* 4. VERIFY / BAN SALON                                                      */
/* -------------------------------------------------------------------------- */
export const toggleSalonStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const salon = await Salon.findByIdAndUpdate(
      id,
      { verified },
      { new: true }
    );

    if (!salon) {
      return res.status(404).json({ success: false, message: "Salon not found" });
    }

    res.status(200).json({
      success: true,
      message: verified ? "Salon Verified Successfully" : "Salon Access Revoked",
      salon,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Action Failed" });
  }
};

/* -------------------------------------------------------------------------- */
/* 5. DELETE SALON (Permanent)                                                */
/* -------------------------------------------------------------------------- */
export const deleteSalon = async (req, res) => {
  try {
    const { id } = req.params;

    await Salon.findByIdAndDelete(id);

    // Optional: Is salon ke saare tickets bhi delete kar do
    await Ticket.deleteMany({ salonId: id });

    res.status(200).json({ success: true, message: "Salon Deleted Permanently" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};