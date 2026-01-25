const express = require('express');
const router = express.Router();

// Import controller functions
const { registerUser, loginUser, logoutUser } = require("../controllers/userController");
const {
  updateOneUser,
  deleteOneUser,
  getOneUser,
  getLoggedInUserProfile,
  updateLoggedInUserProfile,
  deleteLoggedInUser
} = require('../controllers/admin/userManagementController');

// Import middlewares
const { authenticateUser } = require('../middlewares/authenticateUser');
const { registrationLimiter, loginLimiter } = require('../middlewares/rateLimiter');
const { verifyRecaptcha } = require('../middlewares/recaptcha');

// --- Public Routes ---
// Registration with rate limiting and reCAPTCHA protection
router.post('/register', registrationLimiter, verifyRecaptcha, registerUser);

// Login with rate limiting
router.post('/login', loginLimiter, loginUser);

// Logout (requires authentication)
router.post('/logout', authenticateUser, logoutUser);

// --- Authenticated Routes ---
// SPECIFIC routes must come BEFORE generic parameterized routes.

// Route to get the currently logged-in user's profile
router.get('/me', authenticateUser, getLoggedInUserProfile);

// Route to update the currently logged-in user's profile
router.put('/update', authenticateUser, updateLoggedInUserProfile);

// Delete the currently logged-in user's account
router.delete('/delete', authenticateUser, deleteLoggedInUser);

// --- Generic (parameterized) routes ---
// These should come last.

// Get a single user by their ID
router.get("/:id", authenticateUser, getOneUser);

// Update a single user by their ID (likely for an admin)
router.put("/:id", authenticateUser, updateOneUser);

// Delete a single user by their ID (likely for an admin)
router.delete("/:id", authenticateUser, deleteOneUser);

module.exports = router;
