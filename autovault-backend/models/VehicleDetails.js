const mongoose = require("mongoose");

const VehicleDetailsSchema = new mongoose.Schema(
    {
        vehicleName: {
            type: String,
            required: true,
        },
        vehicleType: {
            type: String,
            required: true,
        },
        fuelCapacityLitres: {
            type: Number,
            required: true,
        },
        loadCapacityKg: {
            type: Number,
            required: true,
        },
        passengerCapacity: {
            type: String,
            required: true,
        },
        pricePerTrip: {
            type: Number,
            required: true,
        },
        filepath: {
            type: String,
        },
        vehicleDescription: {
            type: String,
            required: false, 
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("VehicleDetail", VehicleDetailsSchema);
