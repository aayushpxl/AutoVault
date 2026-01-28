import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, RefreshCw, Home } from "lucide-react";

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h2>
                <p className="text-gray-600 mb-8">
                    Something went wrong with your transaction. Please try again or contact support if the issue persists.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-200"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again from Bookings
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
