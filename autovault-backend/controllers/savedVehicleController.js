const SavedVehicle = require("../models/SavedVehicle");

// Add a vehicle to saved vehicles
exports.addSavedVehicle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { vehicleId } = req.body;

    if (!vehicleId) {
      return res.status(400).json({ message: "vehicleId is required" });
    }

    const savedVehicle = new SavedVehicle({ userId, vehicleId });
    await savedVehicle.save();

    res.status(201).json({ message: "Vehicle saved successfully", savedVehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vehicle already saved" });
    }
    res.status(500).json({ message: "Failed to save vehicle", error: error.message });
  }
};

// Remove a saved vehicle
exports.removeSavedVehicle = async (req, res) => {
  try {
    const userId = req.user._id;
    const { vehicleId } = req.params;

    const result = await SavedVehicle.findOneAndDelete({ userId, vehicleId });
    if (!result) {
      return res.status(404).json({ message: "Saved vehicle not found" });
    }

    res.status(200).json({ message: "Vehicle removed from saved list" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove saved vehicle", error: error.message });
  }
};

// Get all saved vehicles for user
exports.getSavedVehicles = async (req, res) => {
  try {
    const userId = req.user._id;
    const savedVehicles = await SavedVehicle.find({ userId }).populate("vehicleId");

    res.status(200).json(savedVehicles);
  } catch (error) {
    res.status(500).json({ message: "Failed to get saved vehicles", error: error.message });
  }
};
