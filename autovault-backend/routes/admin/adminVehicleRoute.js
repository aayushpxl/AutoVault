const express = require("express");
const router = express.Router();

// Corrected middleware import — change "uploads" to "upload" if your file is upload.js
const upload = require("../../middlewares/uploads");

const {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    getOneVehicle,
    deleteVehicle
} = require("../../controllers/admin/vehicleManagementController");

// Route to create a vehicle with a single file upload named 'file'
router.post(
    "/create",
    upload.single("image"),
    createVehicle
);

// Updated vehicle
// router.put("/update/:id", upload.single("imageFile"), updateVehicle);

// Get all vehicles
router.get(
    "/",
    getAllVehicles
);
router.get(
    "/:id",
    getOneVehicle
);

// Update vehicle by ID
router.put("/:id",
     upload.single("image"),
      updateVehicle);

// Delete vehicle by ID
router.delete(
    "/:id",
    deleteVehicle
);

module.exports = router;
