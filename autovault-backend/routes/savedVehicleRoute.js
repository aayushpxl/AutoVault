const express = require("express");
const router = express.Router();
const savedVehicleController = require("../controllers/savedVehicleController");
const { authenticateUser } = require("../middlewares/authenticateUser");

router.use(authenticateUser);

router.post("/", savedVehicleController.addSavedVehicle);
router.delete("/:vehicleId", savedVehicleController.removeSavedVehicle);
router.get("/", savedVehicleController.getSavedVehicles);

module.exports = router;
