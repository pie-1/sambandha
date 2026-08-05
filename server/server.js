/**
 * Main Server File
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const draftRoutes = require("./routes/draftRoutes");
const commentRoutes = require("./routes/commentRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");

// Import error handlers
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    status: 'running', 
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/drafts/:draftId/comments", commentRoutes);
app.use("/api/drafts/:draftId/feedback", feedbackRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/simulate", simulatorRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB Connected`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

module.exports = app;