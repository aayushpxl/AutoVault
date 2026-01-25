const mongoose = require("mongoose");

const SavedVehicleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleDetail",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicates of same saved vehicle for a user
SavedVehicleSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });

module.exports = mongoose.model("SavedVehicle", SavedVehicleSchema);
