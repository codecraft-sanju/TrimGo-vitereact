import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./Database/db.js";
import authRoutes from "./Routes/authRoutes.js";
import salonRoutes from "./Routes/salonRoutes.js";

// Load Env
dotenv.config();

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT ;

// Middleware
app.use(express.json()); // JSON data
app.use(express.urlencoded({ extended: true })); // Form data
app.use(cookieParser());

// CORS Setup (Important for Frontend cookies)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/salon", salonRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send(`Server is running on Port ${PORT}`);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});