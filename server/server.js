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
const healthMlRoutes = require("./routes/healthMlRoutes");
const priorityRoutes = require("./routes/priorityRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));


app.use("/api/auth", authRoutes);
app.use("/api/drafts", draftRoutes);
app.use("/api/drafts/:draftId/comments", commentRoutes);
app.use("/api/drafts/:draftId/feedback", feedbackRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/simulate", simulatorRoutes);
app.use("/api/ml/health", healthMlRoutes);
app.use("/api/priorities", priorityRoutes);
app.use("/api/projects", projectRoutes);


app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message,
  });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

module.exports = app;