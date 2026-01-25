const Booking = require("../models/Booking");
const Vehicle = require("../models/VehicleDetails");

// Create a new booking (user)
exports.createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, pickupLocation, dropLocation } = req.body;

    if (!req.user._id) {
      return res.status(400).json({ message: "userId is required for testing" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return res.status(400).json({ message: "Invalid booking duration" });
    }

    const pickupFee = pickupLocation !== "default" ? 500 : 0;
    const dropFee = dropLocation !== "default" ? 300 : 0;

    const totalPrice = days * vehicle.pricePerTrip + pickupFee + dropFee;

    const booking = new Booking({
      userId: req.user._id,
      vehicleId,
      startDate: start,
      endDate: end,
      pickupLocation,
      dropLocation,
      totalPrice,
    });

    await booking.save();
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate("vehicleId", "vehicleName vehicleType pricePerTrip filepath");


    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get bookings", error: error.message });
  }
};

// Get user's own bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("vehicleId", "vehicleName vehicleType pricePerTrip filepath");

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get your bookings", error: error.message });
  }
};

// Cancel a booking (user or admin)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel booking", error: error.message });
  }
};

//  Update booking
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updates = req.body;

    const booking = await Booking.findByIdAndUpdate(bookingId, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error: error.message });
  }
};

//  Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking", error: error.message });
  }
};
// Get a single booking by ID
exports.getOneBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate("vehicleId", "vehicleName vehicleType pricePerTrip");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to get booking", error: error.message });
  }
};