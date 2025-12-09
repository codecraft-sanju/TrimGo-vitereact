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
  },
  {
    timestamps: true,
  }
);

// -------------------------------------
// Password hash before save 🔐 (Fixed)
// -------------------------------------
userSchema.pre("save", async function () {
  // Note: Yahan 'next' parameter hata diya hai

  // agar password change hi nahi hua to return (function yahi khatam)
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Yahan ab next() call karne ki zarurat nahi hai, async function automatically complete maana jayega
  } catch (err) {
    throw err; // next(err) ki jagah error throw karo
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