import jwt from "jsonwebtoken";
import Salon from "../Models/Salon.js";
import Ticket from "../Models/Ticket.js"; 
import User from "../Models/User.js"; 
import { sendWhatsappMessage } from "../utils/sendWhatsapp.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: true, 
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION CONTROLLERS (Register/Login/Logout)                         */
/* -------------------------------------------------------------------------- */

export const registerSalon = async (req, res) => {
  try {
    const { 
      salonName, ownerName, email, phone, address, zipCode, password, 
      type, latitude, longitude,
      referralCode 
    } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !zipCode || !password || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Please fill all fields and Pin your location." });
    }

    let salon = await Salon.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    
    if (salon && salon.isPhoneVerified) {
        return res.status(400).json({ success: false, message: "Salon already registered and verified." });
    }

    let referringUserId = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Referral Code. Please check or leave empty." 
        });
      }
      referringUserId = referrer._id;
    }

    const isOtpEnabled = process.env.OTP_SERVICE_ENABLED === "true";

    if (isOtpEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

      if (salon && !salon.isPhoneVerified) {
          salon.salonName = salonName;
          salon.ownerName = ownerName;
          salon.email = email.toLowerCase();
          salon.address = address;
          salon.zipCode = zipCode;
          salon.password = password;
          salon.salonType = type || "Unisex";
          salon.latitude = latitude;
          salon.longitude = longitude;
          salon.otp = otp;
          salon.otpExpiry = otpExpiry;
          salon.referredBy = referringUserId;
          await salon.save();
      } else {
          salon = await Salon.create({
            salonName,
            ownerName,
            email: email.toLowerCase(),
            phone,
            address,
            zipCode,
            password,
            salonType: type || "Unisex",
            latitude,
            longitude,
            isOnline: true,
            verified: false,
            isPhoneVerified: false,
            services: [],
            staff: [],
            gallery: [],
            otp,
            otpExpiry,
            referredBy: referringUserId 
          });
      }

      const whatsappMsg = `Hi ${ownerName}, your verification code for registering your salon on TrimGo is ${otp}. Valid for 10 minutes.`;
      await sendWhatsappMessage(phone, whatsappMsg);

      return res.status(200).json({ 
          success: true, 
          message: "OTP sent to salon phone number successfully",
          phone: salon.phone 
      });

    } else {
      
      if (salon && !salon.isPhoneVerified) {
          salon.salonName = salonName;
          salon.ownerName = ownerName;
          salon.email = email.toLowerCase();
          salon.address = address;
          salon.zipCode = zipCode;
          salon.password = password;
          salon.salonType = type || "Unisex";
          salon.latitude = latitude;
          salon.longitude = longitude;
          salon.isPhoneVerified = true;
          salon.otp = undefined;
          salon.otpExpiry = undefined;
          salon.referredBy = referringUserId;
          await salon.save();
      } else {
          salon = await Salon.create({
            salonName,
            ownerName,
            email: email.toLowerCase(),
            phone,
            address,
            zipCode,
            password,
            salonType: type || "Unisex",
            latitude,
            longitude,
            isOnline: true,
            verified: false,
            isPhoneVerified: true, 
            services: [],
            staff: [],
            gallery: [],
            referredBy: referringUserId 
          });
      }

      if (referringUserId) {
        await User.findByIdAndUpdate(referringUserId, {
            $push: { referredSalons: salon._id }
        });
      }

      req.io.emit("salon_registered", salon);

      const token = createToken(salon._id);
      res.cookie("salon_token", token, cookieOptions);

      return res.status(201).json({
        success: true,
        message: "Salon registered successfully",
        salon: salon.toJSON(),
      });
    }

  } catch (err) {
    console.error("Register Error:", err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Email or Phone already exists." });
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifySalonRegistrationOtp = async (req, res) => {
    try {
      const { phone, otp } = req.body;
  
      if (!phone || !otp) {
        return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
      }
  
      const salon = await Salon.findOne({ phone }).select("+otp +otpExpiry");
  
      if (!salon) {
        return res.status(404).json({ success: false, message: "Salon not found" });
      }
  
      if (salon.isPhoneVerified) {
        return res.status(400).json({ success: false, message: "Salon is already verified" });
      }
  
      if (salon.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
  
      if (salon.otpExpiry < new Date()) {
        return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
      }
  
      salon.isPhoneVerified = true;
      salon.otp = undefined;
      salon.otpExpiry = undefined;
      await salon.save();

      if (salon.referredBy) {
        await User.findByIdAndUpdate(salon.referredBy, {
            $push: { referredSalons: salon._id }
        });
      }

      req.io.emit("salon_registered", salon);
  
      const token = createToken(salon._id);
      res.cookie("salon_token", token, cookieOptions);
  
      return res.status(200).json({
        success: true,
        message: "Salon verification successful! Welcome to TrimGo.",
        salon: salon.toJSON(),
      });
  
    } catch (err) {
      console.error("Salon OTP Verification Error:", err);
      return res.status(500).json({ success: false, message: "Server Error during verification" });
    }
};

export const loginSalon = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ success: false, message: "Please provide credentials." });

    const salon = await Salon.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select("+password");

    if (!salon || !(await salon.comparePassword(password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }

    if (!salon.isPhoneVerified) {
        return res.status(403).json({
          success: false,
          message: "Your salon account is not verified. Please verify your phone number first.",
        });
    }

    const token = createToken(salon._id);
    res.cookie("salon_token", token, cookieOptions);

    return res.status(200).json({ success: true, message: `Welcome back, ${salon.salonName}!`, salon: salon.toJSON() });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const logoutSalon = (req, res) => {
  res.clearCookie("salon_token", cookieOptions);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

/* -------------------------------------------------------------------------- */
/* PUBLIC API: GET ALL SALONS (WITH REAL-TIME ESTIMATE CALCULATION)           */
/* -------------------------------------------------------------------------- */
export const getAllSalons = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = { isPhoneVerified: true }; 

    if (type && type !== "All") {
        query.salonType = type;
    }

    if (search) {
      query.$or = [
        { salonName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } }
      ];
    }
    
    const salons = await Salon.find(query)
      .select("-password") 
      .sort({ isOnline: -1, rating: -1 })
      .lean(); 

    const salonsWithData = await Promise.all(salons.map(async (salon) => {
        
        // --- CHANGED START ---
        // Select mein serviceStartTime add kiya
        const activeTickets = await Ticket.find({
            salonId: salon._id,
            status: { $in: ["pending", "waiting", "serving"] } 
        }).select("totalTime updatedAt serviceStartTime status");
        // --- CHANGED END ---

        const waitingCount = activeTickets.length;
        
        // Exact Estimate Time Calculation
        let totalEstTimeMins = 0;
        const now = new Date();
        for(const t of activeTickets){
           if(t.status === 'serving'){
              // --- CHANGED START ---
              // Timer calculation ab actual service start time se hogi
              const startTime = t.serviceStartTime ? new Date(t.serviceStartTime) : new Date(t.updatedAt);
              const elapsedMins = (now - startTime) / (1000 * 60);
              // --- CHANGED END ---
              totalEstTimeMins += Math.max(0, (t.totalTime || 0) - elapsedMins);
           } else {
              totalEstTimeMins += (t.totalTime || 0);
           }
        }

        const waitTimeInSeconds = Math.round(totalEstTimeMins * 60);
        const expectedStartTime = new Date(now.getTime() + (waitTimeInSeconds * 1000));

        return { 
            ...salon, 
            waiting: waitingCount, 
            estTime: Math.round(totalEstTimeMins),
            waitTimeInSeconds: waitTimeInSeconds,
            expectedStartTime: expectedStartTime
        };
    }));

    res.status(200).json({ 
        success: true, 
        count: salonsWithData.length, 
        salons: salonsWithData 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching salons" });
  }
};

/* -------------------------------------------------------------------------- */
/* UPDATE SALON PROFILE                                                       */
/* -------------------------------------------------------------------------- */
export const updateSalonProfile = async (req, res) => {
  try {
    const salonId = req.salon._id;
    const updates = req.body; 

    if (updates.gallery && updates.gallery.length > 4) {
        return res.status(400).json({ success: false, message: "Maximum 4 photos allowed." });
    }

    const updatedSalon = await Salon.findByIdAndUpdate(salonId, updates, {
      new: true,
      runValidators: true,
    });
    
    if (updates.isOnline !== undefined) {
        req.io.emit("salon_updated", { 
            id: salonId, 
            isOnline: updatedSalon.isOnline 
        });
    }
    
    if (updates.gallery) {
        req.io.emit("salon_updated", {
            id: salonId,
            gallery: updatedSalon.gallery
        });
    }

    res.status(200).json({ success: true, salon: updatedSalon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Update Failed" });
  }
};