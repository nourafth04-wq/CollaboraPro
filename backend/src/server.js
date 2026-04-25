import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";

import authRoutes         from "./routes/authRoutes.js";
import userRoutes         from "./routes/userRoutes.js";
import logRoutes          from "./routes/logRoutes.js";
import passwordRoutes     from "./routes/passwordRoutes.js";
import projectRoutes      from "./routes/projectRoutes.js";
import taskRoutes         from "./routes/taskRoutes.js";
import documentRoutes     from "./routes/documentRoutes.js";
import statsRoutes        from "./routes/statsRoutes.js";
import messageRoutes      from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes    from "./routes/dashboardRoutes.js";
import commentRoutes      from "./routes/commentRoutes.js";
import subTaskRoutes      from "./routes/subTaskRoutes.js";

dotenv.config();
await connectDB();

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true },
});
console.log("✅ Socket.IO initialized");

io.on("connection", (socket) => {
  socket.on("join_project",  (pid) => socket.join(`project_${pid}`));
  socket.on("leave_project", (pid) => socket.leave(`project_${pid}`));
  socket.on("send_message",  (data) => io.to(`project_${data.projectId}`).emit("new_message", data));
});

app.set("io", io);
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Sprint 1
app.use("/api/auth",      authRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/logs",      logRoutes);
app.use("/api/password",  passwordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/comments",  commentRoutes);
app.use("/api/subtasks",  subTaskRoutes);

// Sprint 2 & 3 — nested routes BEFORE /api/projects to avoid /:id collision
app.use("/api/projects/:projectId/tasks",     taskRoutes);
app.use("/api/projects/:projectId/documents", documentRoutes);
app.use("/api/projects/:projectId/stats",     statsRoutes);
app.use("/api/projects/:projectId/messages",  messageRoutes);
app.use("/api/projects",                      projectRoutes);
app.use("/api/notifications",                 notificationRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CollaboraPro running on port ${PORT}`));

export { io };
