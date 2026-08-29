const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const draftRoutes = require("./routes/draftRoutes");
const commentRoutes = require("./routes/commentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const parliamentRoutes = require("./routes/parliamentRoutes");
const healthMlRoutes = require("./routes/healthMlRoutes");

const app = express();

const allowedOrigins = [
  "https://sambandha.vercel.app",
  "https://sambandha-woad.vercel.app",
  "https://sambandha-6na2l9sz1-pie-2.vercel.app",
  "http://localhost:5173",
  "https://sambandha.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }

      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }
      console.warn(`CORS blocked: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/drafts/:draftId/comments", commentRoutes);
app.use("/api/drafts/:draftId/feedback", feedbackRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/simulate", simulatorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/parliament", parliamentRoutes);
app.use("/api/ml", healthMlRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/api`);
      console.log(`CORS allowed origins:`, allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

module.exports = app;