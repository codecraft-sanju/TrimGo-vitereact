import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const salonSchema = new mongoose.Schema(
  {
    salonName: {
      type: String,
      required: [true, "Salon Name is required"],
      trim: true,
      minlength: 2,
    },
    ownerName: {
      type: String,
      required: [true, "Owner Name is required"],
      trim: true,
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
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    zipCode: {
      type: String,
      required: [true, "Zip Code is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    salonType: {
      type: String,
      enum: ["Unisex", "Men Only", "Women Only"],
      required: [true, "Salon type is required"],
      default: "Unisex",
    },
    latitude: {
      type: Number,
      required: [true, "Location (Latitude) is required."],
    },
    longitude: {
      type: Number,
      required: [true, "Location (Longitude) is required."],
    },

    // --- NEW DYNAMIC FIELDS (Added for Dashboard) ---
    
    // 1. Online/Offline Status (Red/Green Dot)
    isOnline: {
      type: Boolean,
      default: true, 
    },

    // 2. Admin Verification Status
    verified: {
      type: Boolean,
      default: false, 
    },

    // 3. Ratings (For Sorting)
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },

    // 4. Services Menu (Price & Time)
    services: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        time: { type: Number, required: true }, // Duration in minutes
        category: { type: String, default: "General" }
      }
    ],

    // 5. Staff Members (For Assignment)
    staff: [
      {
        name: String,
        status: { type: String, default: 'available' }
      }
    ]
  },
  {
    timestamps: true,
  }
);

// -------------------------------------
// Password Hash Logic
// -------------------------------------
salonSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// -------------------------------------
// Compare Password
// -------------------------------------
salonSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// -------------------------------------
// Hide password in response
// -------------------------------------
salonSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const Salon = mongoose.model("Salon", salonSchema);

export default Salon;