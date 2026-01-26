import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../api/Api"; // Assuming you have an axios instance configured
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { AuthContext } from "../../auth/AuthProvider";

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Invalid verification link.");
                return;
            }

            try {
                const response = await axios.get(`/auth/verify-email/${token}`);
                const { data, token: authToken, message: successMsg } = response.data;

                setStatus("success");
                setMessage(successMsg || "Email verified successfully!");

                // Log the user in automatically
                if (data && authToken) {
                    login(data, authToken);

                    // Redirect to home after a short delay to let the user read the message
                    setTimeout(() => {
                        if (data.role === "admin") {
                            navigate("/admin/dashboard");
                        } else {
                            navigate("/home");
                        }
                    }, 3000);
                }
            } catch (error) {
                setStatus("error");
                setMessage(
                    error.response?.data?.message || "Failed to verify email. The link may be expired or invalid."
                );
            }
        };

        verifyEmail();
    }, [token, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                {status === "verifying" && (
                    <div className="flex flex-col items-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-800">Verifying...</h2>
                        <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <FaCheckCircle className="text-5xl text-green-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verified!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 block"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <FaTimesCircle className="text-5xl text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;
