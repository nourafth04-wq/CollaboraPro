import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import hpp from "hpp";

// ✅ Database
import { connectDB } from "./src/config/database.js";

// ✅ Routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import logRoutes from "./src/routes/logRoutes.js";
import passwordRoutes from "./src/routes/passwordRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import commentRoutes from "./src/routes/commentRoutes.js";
import subTaskRoutes from "./src/routes/subTaskRoutes.js";

dotenv.config();

const app = express();

/* =======================================================
   GLOBAL MIDDLEWARES
======================================================= */

// ✅ Body parser
app.use(express.json({ limit: "10kb" }));

// ✅ Prevent HTTP Parameter Pollution
app.use(hpp());

// ✅ Secure HTTP headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "data:", "blob:"],
        "script-src": ["'self'", "'unsafe-inline'"]
      }
    }
  })
);

// ✅ CORS
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

// ✅ Logger
app.use(morgan("dev"));

/* =======================================================
   ROUTES
======================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/password", passwordRoutes);

// ✅ Sprint 2 API (mounted on /api for consistency)
app.use("/api/projects", projectRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", taskRoutes);
app.use("/api", documentRoutes);
app.use("/api", commentRoutes);
app.use("/api", subTaskRoutes);

// ✅ Serve uploaded documents
app.use("/uploads", express.static("uploads"));

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ API Running!" });
});

/* =======================================================
   DATABASE & SERVER
======================================================= */

// ✅ MongoDB
connectDB();

// ✅ Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);