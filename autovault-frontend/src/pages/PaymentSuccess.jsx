import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../api/Api";
import { toast } from "react-toastify";
import { CheckCircle, Loader2 } from "lucide-react";

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const encodedData = searchParams.get("data");
            if (!encodedData) {
                toast.error("Invalid payment data");
                navigate("/");
                return;
            }

            try {
                const response = await axios.get(`/payment/verify-esewa?data=${encodedData}`);
                setData(response.data);
                toast.success("Payment Verified Successfully!");
            } catch (error) {
                console.error("Verification failed", error);
                toast.error("Payment verification failed. Please contact support.");
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    if (verifying) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Verifying Payment...</h2>
                <p className="text-gray-600">Please do not refresh the page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-green-100">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-8">
                    Thank you for choosing AutoVault. Your booking has been confirmed.
                </p>

                {data && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Transaction ID:</span>
                            <span className="text-gray-900 font-bold">{data.booking?.transactionId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 font-medium">Amount Paid:</span>
                            <span className="text-green-600 font-bold font-mono">NPR {data.booking?.totalPrice}</span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => navigate("/my-bookings")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
                >
                    View My Bookings
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess;
