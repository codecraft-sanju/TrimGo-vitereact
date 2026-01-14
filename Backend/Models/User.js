import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please enter a valid phone number"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    referralCode: {
      type: String,
      unique: true,
    },
    
    referredSalons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon"
      }
    ],

    // --- 🔥 NEW: Play Store 14-Day Tracker Logic ---
    
    // 1. Last Active Time (Sorting ke liye: "Just Now" dikhane ke liye)
    lastActiveAt: {
      type: Date,
    },

    // 2. Attendance Register (Isme dates save hongi: ["2024-01-14", "2024-01-15"])
    // Isse hum 14 din ka calendar bana payenge
    activeDates: [
      {
        type: String 
      }
    ]
  },
  {
    timestamps: true,
  }
);

// -------------------------------------
// Password hash & Referral Code Generation
// -------------------------------------
userSchema.pre("save", async function () {
  
  if (!this.referralCode) {
    const namePart = this.name ? this.name.substring(0, 3).toUpperCase() : "USR";
    const randomPart = Math.floor(1000 + Math.random() * 9000); 
    this.referralCode = `${namePart}${randomPart}`;
  }

  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;