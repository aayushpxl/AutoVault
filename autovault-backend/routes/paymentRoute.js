const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateUser } = require("../middlewares/authenticateUser");

router.post("/initiate-esewa", authenticateUser, paymentController.initiateEsewaPayment);
router.get("/verify-esewa", paymentController.verifyEsewaPayment);

module.exports = router;
