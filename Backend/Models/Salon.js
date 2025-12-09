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
    // Baad mein hum yahan services, slots, images add karenge
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
// Password Verification Logic
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