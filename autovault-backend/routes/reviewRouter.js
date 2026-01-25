const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/ReviewController");
const { authenticateUser } = require("../middlewares/authenticateUser");

router.post("/", authenticateUser, reviewController.addReview);
router.get("/:vehicleId", reviewController.getVehicleReviews);

module.exports = router;
