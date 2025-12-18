import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http"; // HTTP Server import karein
import { Server } from "socket.io"; // Socket.io import karein
import connectDB from "./Database/db.js";

// Routes Imports
import authRoutes from "./Routes/authRoutes.js";
import salonRoutes from "./Routes/salonRoutes.js";
import queueRoutes from "./Routes/queueRoutes.js"; // Queue System ke liye
import adminRoutes from "./Routes/adminRoutes.js"; // Admin Dashboard ke liye

// Load Env
dotenv.config();

// Connect Database
connectDB();

const app = express();

// --- SOCKET.IO SETUP START ---
const server = http.createServer(app); // App ko HTTP server mein wrap karein

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Socket Connection Logic
io.on("connection", (socket) => {
  console.log("🟢 New Client Connected:", socket.id);

  // Join Room Logic (Isse hum specific Salon ya User ko target kar payenge)
  // Frontend se emit hoga: socket.emit("join_room", "salon_123") ya "user_456"
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client Disconnected:", socket.id);
  });
});

// Make 'io' accessible in Controllers (req.io)
app.use((req, res, next) => {
  req.io = io;
  next();
});
// --- SOCKET.IO SETUP END ---

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // JSON data
app.use(express.urlencoded({ extended: true })); // Form data
app.use(cookieParser());

// CORS Setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.use("/api/auth", authRoutes);   // User Auth
app.use("/api/salon", salonRoutes); // Salon Auth & Profile
app.use("/api/queue", queueRoutes); // Real-time Queue Logic
app.use("/api/admin", adminRoutes); // Admin Stats

// Test Route
app.get("/", (req, res) => {
  res.send(`Real-time Server is running on Port ${PORT}`);
});

// Start Server (Use 'server.listen' instead of 'app.listen')
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});