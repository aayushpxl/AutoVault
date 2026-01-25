const mongoose = require("mongoose");

const VehicleOwnerSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true,
        },
         
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String
        },
        role: {
            type: String,
            default: "normal"
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("VehicleOwner", VehicleOwnerSchema);
