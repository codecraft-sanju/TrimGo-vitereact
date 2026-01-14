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

    // --- Referral System Fields ---
    referralCode: {
      type: String,
      unique: true,
    },
    
    // Yahan hum save karenge ki is user ne kin salons ko refer kiya
    referredSalons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Salon"
      }
    ],

    // 🔥 NEW: Track Last App Open Time (For Testing/Activity)
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// -------------------------------------
// Password hash & Referral Code Generation
// -------------------------------------
userSchema.pre("save", async function () {
  
  // 1. Generate Referral Code (Agar pehle se nahi hai)
  if (!this.referralCode) {
    // Logic: Name ke first 3 letters + 4 Random Numbers (e.g., SAN9821)
    const namePart = this.name ? this.name.substring(0, 3).toUpperCase() : "USR";
    const randomPart = Math.floor(1000 + Math.random() * 9000); 
    this.referralCode = `${namePart}${randomPart}`;
  }

  // 2. Password Hashing (Existing Logic)
  // Agar password change nahi hua, toh yahi return kar jao
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// -------------------------------------
// Compare password method
// -------------------------------------
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// -------------------------------------
// Remove password from JSON response
// -------------------------------------
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;