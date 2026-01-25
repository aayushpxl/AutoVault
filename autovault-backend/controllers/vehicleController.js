const Vehicle = require('../models/VehicleDetails');

// ✅ GET /api/vehicles/:id
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET /api/vehicles/related/:id
exports.getRelatedVehicles = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    const related = await Vehicle.find({
      vehicleType: vehicle.vehicleType,
      _id: { $ne: vehicle._id },
    }).limit(4);

    res.json(related);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET /api/vehicles/search?query=...
exports.searchVehicles = async (req, res) => {
  try {
    const query = req.query.query || "";

    const vehicles = await Vehicle.find({
      $or: [
        { vehicleName: { $regex: query, $options: "i" } },
        { vehicleType: { $regex: query, $options: "i" } },
        { vehicleDescription: { $regex: query, $options: "i" } },
      ],
    });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};
// GET /api/vehicles/types
exports.getVehicleTypes = async (req, res) => {
  try {
    const types = await Vehicle.distinct("vehicleType");
    res.json(types); // sends array of unique vehicle types
  } catch (err) {
    res.status(500).json({ message: "Server error fetching vehicle types" });
  }
};

