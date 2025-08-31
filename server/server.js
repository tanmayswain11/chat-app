import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";

import useRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

import { Server } from "socket.io";
import Message from "./models/Message.js";
import cloudinary from "./lib/cloudinary.js";

// 🔹 Connect to MongoDB
const dbURL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zwgivl5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(dbURL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// 🔹 Express + HTTP server
const app = express();
const server = http.createServer(app);

// 🔹 Initialize Socket.io
export const io = new Server(server, {
  cors: { origin: "*" },
});

// 🔹 Track online users
export const userSocketMap = {}; // { userId: socketId }

// 🔹 Socket.io logic
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // send online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Listen for sendMessage from frontend
  socket.on("sendMessage", async ({ senderId, receiverId, text, image }) => {
    try {
      let imageUrl;
      if (image) {
        const upload = await cloudinary.uploader.upload(image);
        imageUrl = upload.secure_url;
      }

      const newMessage = await Message.create({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

      // emit to receiver if online
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      // emit back to sender
      io.to(socket.id).emit("newMessage", newMessage);
    } catch (err) {
      console.error("❌ Error in sendMessage:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// 🔹 Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// 🔹 Routes
app.use("/api/status", (req, res) => res.send("✅ Server is live"));
app.use("/api/auth", useRouter);
app.use("/api/messages", messageRouter);

// 🔹 Start server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
}

export default server;
