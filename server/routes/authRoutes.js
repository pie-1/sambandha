
/**
 * Authentication Routes
 * 
 * Handles user registration, login, logout, and profile
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");
const { validateRegistration } = require("../middleware/validation");

// Routes - use authController.methodName
router.post("/register", validateRegistration, authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", verifyToken, authController.getMe);

module.exports = router;