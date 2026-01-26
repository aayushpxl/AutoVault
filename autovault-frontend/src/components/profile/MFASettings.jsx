import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import {
    getMFAStatusApi,
    setupMFAApi,
    verifyMFASetupApi,
    disableMFAApi
} from "../../api/authApi";
import { FaShieldAlt, FaCheckCircle, FaTimes, FaKey } from "react-icons/fa";

const MFASettings = () => {
    const [status, setStatus] = useState("loading"); // loading, enabled, disabled
    const [setupStep, setSetupStep] = useState("idle"); // idle, qr, success
    const [qrData, setQrData] = useState(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await getMFAStatusApi();
            if (res.data.data.enabled) {
                setStatus("enabled");
            } else {
                setStatus("disabled");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load MFA status");
        }
    };

    const handleStartSetup = async () => {
        try {
            const res = await setupMFAApi();
            if (res.data.success) {
                setQrData(res.data.data);
                setSetupStep("qr");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to start MFA setup");
        }
    };

    const handleVerifySetup = async () => {
        if (!verifyCode) return toast.error("Please enter the code");

        try {
            const res = await verifyMFASetupApi({ code: verifyCode });
            if (res.data.success) {
                if (qrData?.backupCodes) {
                    setBackupCodes(Array.isArray(qrData.backupCodes)
                        ? qrData.backupCodes.map(bc => bc.code || bc)
                        : []);
                }
                setSetupStep("success");
                setStatus("enabled");
                toast.success("Two-Factor Authentication Enabled!");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid code");
        }
    };

    const handleDisableMFA = async (e) => {
        e.preventDefault();
        if (!disablePassword) return toast.error("Password is required");

        try {
            await disableMFAApi({ password: disablePassword });
            setStatus("disabled");
            setShowDisableModal(false);
            setDisablePassword("");
            toast.success("Two-Factor Authentication Disabled");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to disable MFA");
        }
    };

    if (status === "loading") return <div className="p-4 bg-white rounded-xl border animate-pulse h-32"></div>;

    return (
        <div className="bg-white shadow-sm border rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FaShieldAlt className={`text-xl ${status === "enabled" ? "text-green-600" : "text-gray-400"}`} />
                        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                    </div>

                    <p className="text-sm text-gray-500 max-w-xl">
                        Add an extra layer of security to your account by requiring a verification code from your
                        authenticator app (like Google Authenticator) when you log in.
                    </p>
                </div>

                {status === "enabled" ? (
                    <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            <FaCheckCircle /> Enabled
                        </span>
                        <button
                            onClick={() => setShowDisableModal(true)}
                            className="text-sm text-red-600 hover:text-red-800 hover:underline"
                        >
                            Disable MFA
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleStartSetup}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                        Enable 2FA
                    </button>
                )}
            </div>

            {/* Setup Flow */}
            {status === "disabled" && setupStep === "qr" && qrData && (
                <div className="mt-6 border-t pt-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <QRCodeSVG value={qrData.otpauthUrl || "otpauth://totp/AutoVault?secret=" + qrData.manualEntrySecret} size={160} className="border p-2 rounded" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium mb-2">1. Scan QR Code</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Open your authenticator app (Google Authenticator, Authy, etc.) and scan the QR code.
                            </p>
                            <p className="text-xs text-gray-500 mb-4">
                                Can't scan? Enter this code manually: <span className="font-mono bg-gray-100 p-1 rounded select-all">{qrData.manualEntrySecret}</span>
                            </p>

                            <h4 className="font-medium mb-2">2. Enter Verification Code</h4>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.trim())}
                                    placeholder="000 000"
                                    className="border rounded-lg px-4 py-2 w-32 text-center text-lg tracking-wider focus:outline-blue-500"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleVerifySetup}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Verify & Enable
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSetupStep("idle")} className="text-gray-400 hover:text-gray-600 text-sm mt-4">Cancel Setup</button>
                </div>
            )}

            {/* Success View with Backup Codes */}
            {setupStep === "success" && (
                <div className="mt-6 border-t pt-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                            <FaCheckCircle /> Setup Complete!
                        </div>
                        <p className="text-sm text-green-600">
                            Two-factor authentication is now enabled on your account.
                        </p>
                    </div>

                    {backupCodes.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FaKey className="text-gray-500" />
                                <h4 className="font-medium">Backup Codes</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Save these backup codes in a safe place. You can use them to log in if you lose access to your authenticator app.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="text-center bg-white border rounded py-1 select-all hover:bg-gray-100">
                                        {code}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-xs text-red-500">
                                * These codes will only be shown once. Copy them now!
                            </div>
                        </div>
                    )}
                    <button onClick={() => setSetupStep("idle")} className="bg-gray-800 text-white px-4 py-2 rounded mt-4 text-sm">Done</button>
                </div>
            )}

            {/* Disable Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Disable 2FA?</h3>
                            <button onClick={() => setShowDisableModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.
                        </p>

                        <form onSubmit={handleDisableMFA}>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                className="w-full border rounded-lg p-2 mb-4"
                                placeholder="Enter your password"
                                required
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDisableModal(false)}
                                    className="text-gray-600 hover:text-gray-800 text-sm px-3 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Disable 2FA
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MFASettings;
