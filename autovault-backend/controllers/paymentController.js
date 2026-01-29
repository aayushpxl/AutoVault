const crypto = require("crypto");
const Booking = require("../models/Booking");

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

// Generate eSewa Signature
const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
    // eSewa v2 signature string format: total_amount=VALUE,transaction_uuid=VALUE,product_code=VALUE
    const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    // DEBUG: Log the exact string being signed
    console.log('--- eSewa Signature Debug ---');
    console.log('String to sign:', data);
    console.log('Secret Key (masked):', ESEWA_SECRET_KEY.substring(0, 4) + '...');

    const signature = crypto
        .createHmac("sha256", ESEWA_SECRET_KEY)
        .update(data)
        .digest("base64");

    console.log('Generated Signature:', signature);
    return signature;
};

exports.initiateEsewaPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const transaction_uuid = `${bookingId}-${Date.now()}`;
        // Use raw string representation of totalPrice for both signature and form data
        const amt = booking.totalPrice.toString();

        const signature = generateEsewaSignature(amt, transaction_uuid, ESEWA_PRODUCT_CODE);

        const formData = {
            amount: amt,
            failure_url: "http://localhost:5173/payment-failure",
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: ESEWA_PRODUCT_CODE,
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: "http://localhost:5173/payment-success",
            tax_amount: "0",
            total_amount: amt,
            transaction_uuid: transaction_uuid,
        };

        res.status(200).json({
            message: "Payment initiated",
            formData,
            esewa_url: process.env.ESEWA_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
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
