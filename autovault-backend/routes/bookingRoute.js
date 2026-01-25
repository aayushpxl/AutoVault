const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticateUser } = require("../middlewares/authenticateUser");

// Create a booking
router.post("/", authenticateUser, bookingController.createBooking);

// Get bookings of logged-in user
router.get("/my", authenticateUser, bookingController.getUserBookings);

// Get all bookings (Admin)
router.get("/", bookingController.getAllBookings);
    
//  Get a single booking by ID
router.get("/:bookingId", authenticateUser, bookingController.getOneBooking);

// Cancel a booking
router.patch("/:bookingId/cancel", authenticateUser, bookingController.cancelBooking);

//  Update a booking
router.patch("/:bookingId", authenticateUser, bookingController.updateBooking);

//  Delete a booking
router.delete("/:bookingId", authenticateUser, bookingController.deleteBooking);

module.exports = router;
