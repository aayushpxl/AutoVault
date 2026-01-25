const VehicleDetail = require("../../models/VehicleDetails");
const fs = require("fs");
const path = require("path");
// CREATE - Add a new vehicle
exports.createVehicle = async (req, res) => {
    try {
        if (!req.body.vehicle) {
            return res.status(400).json({
                success: false,
                message: "Missing vehicle data in form",
            });
        }

        // Parse stringified vehicle JSON sent from frontend/form
        const {
            vehicleName,
            vehicleType,
            fuelCapacityLitres,
            loadCapacityKg,
            passengerCapacity,
            pricePerTrip,
            vehicleDescription
        } = JSON.parse(req.body.vehicle);

        const filepath = req.file ? req.file.filename : null;


        const newVehicle = new VehicleDetail({
            vehicleName,
            vehicleType,
            fuelCapacityLitres,
            loadCapacityKg,
            passengerCapacity,
            pricePerTrip,
            filepath,
            vehicleDescription
        });

        await newVehicle.save();

        return res.status(201).json({
            success: true,
            message: "Vehicle added successfully"
        });

    } catch (error) {
        console.error("Error in createVehicle:", error.message, error.stack);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


// READ - Get all vehicles
exports.getAllVehicles = async (req, res) => {
    try {
        const vehicles = await VehicleDetail.find();
        return res.status(200).json({
            success: true,
            message: "Vehicle data fetched successfully",
            data: vehicles
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// UPDATE - Update a vehicle by ID
exports.updateVehicle = async (req, res) => {
  const _id = req.params.id;

  try {
    const {
      vehicleName,
      vehicleType,
      fuelCapacityLitres,
      loadCapacityKg,
      passengerCapacity,
      pricePerTrip,
      vehicleDescription
    } = req.body;

    const newFile = req.file?.filename;

    const existingVehicle = await VehicleDetail.findById(_id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // If a new image is uploaded, delete the old image
    if (newFile && existingVehicle.filepath) {
  const oldPath = path.join(__dirname, "../../uploads", existingVehicle.filepath);
  console.log("Trying to delete old image at:", oldPath);

  try {
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
      console.log("Old image deleted successfully");
    } else {
      console.log("Old image file does NOT exist, nothing to delete");
    }
  } catch (err) {
    console.error("Failed to delete old image:", err);
  }
}

    const updateData = {
      vehicleName,
      vehicleType,
      fuelCapacityLitres,
      loadCapacityKg,
      passengerCapacity,
      pricePerTrip,
      vehicleDescription
    };

    if (newFile) {
      updateData.filepath = newFile; // only update image if new one is uploaded
    }

    await VehicleDetail.updateOne({ _id }, { $set: updateData });

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// DELETE - Delete a vehicle by ID
exports.deleteVehicle = async (req, res) => {
    const _id = req.params.id;

    try {
        await VehicleDetail.deleteOne({ _id });

        return res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// READ - Get one vehicle by ID
exports.getOneVehicle = async (req, res) => {
  const _id = req.params.id;

  try {
    const vehicle = await VehicleDetail.findById(_id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};