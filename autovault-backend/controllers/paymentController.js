const crypto = require("crypto");
const Booking = require("../models/Booking");

const ESEWA_SECRET_KEY = "8g7h3wnv791G8d6T"; // Sandbox Secret Key
const ESEWA_PRODUCT_CODE = "EPAYTEST"; // Sandbox Product Code

// Generate eSewa Signature
const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
    const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = crypto
        .createHmac("sha256", ESEWA_SECRET_KEY)
        .update(data)
        .digest("base64");
    return hash;
};

exports.initiateEsewaPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const transaction_uuid = `${bookingId}-${Date.now()}`;
        const total_amount = booking.totalPrice.toString();

        const signature = generateEsewaSignature(total_amount, transaction_uuid, ESEWA_PRODUCT_CODE);

        const formData = {
            amount: total_amount,
            failure_url: "http://localhost:5173/payment-failure",
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: ESEWA_PRODUCT_CODE,
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: "http://localhost:5173/payment-success",
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid: transaction_uuid,
        };

        res.status(200).json({
            message: "Payment initiated",
            formData,
            esewa_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        });
    } catch (error) {
        res.status(500).json({ message: "Payment initiation failed", error: error.message });
    }
};

exports.verifyEsewaPayment = async (req, res) => {
    try {
        const { data } = req.query; // eSewa sends data in query after redirect
        if (!data) {
            return res.status(400).json({ message: "Missing data parameter" });
        }

        // Decode Base64 data
        const decodedData = JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
        console.log("Decoded eSewa Data:", decodedData);

        const { status, total_amount, transaction_uuid, transaction_code, signed_field_names, signature } = decodedData;

        // Verify signature from eSewa to ensure it's authentic (optional but recommended)
        // For now, we trust the status 'COMPLETE' and check with our booking

        if (status === "COMPLETE") {
            const bookingId = transaction_uuid.split("-")[0];
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            booking.paymentStatus = "paid";
            booking.transactionId = transaction_code;
            await booking.save();

            return res.status(200).json({ message: "Payment successful", booking });
        } else {
            return res.status(400).json({ message: "Payment failed or incomplete", status });
        }
    } catch (error) {
        res.status(500).json({ message: "Payment verification failed", error: error.message });
    }
};
