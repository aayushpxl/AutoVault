import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";
import {
    getMFAStatusApi,
    setupMFAApi,
    verifyMFASetupApi,
    disableMFAApi
} from "../../api/authApi";
import { FaShieldAlt, FaCheckCircle, FaTimes, FaKey, FaMobileAlt, FaCopy } from "react-icons/fa";

const MFASettings = () => {
    const [status, setStatus] = useState("loading"); // loading, enabled, disabled
    const [setupStep, setSetupStep] = useState("idle"); // idle, qr, success
    const [qrData, setQrData] = useState(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [backupCodes, setBackupCodes] = useState([]);
    const [manualEntry, setManualEntry] = useState(false);

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

    const handleToggleMFA = () => {
        if (status === "enabled") {
            setShowDisableModal(true);
        } else {
            handleStartSetup();
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
            if (!err.response?.data?.securityStatus) {
                toast.error(err.response?.data?.message || "Failed to start MFA setup");
            }
        }
    };

    const handleVerifySetup = async () => {
        if (!verifyCode || verifyCode.length !== 6) {
            return toast.error("Please enter a valid 6-digit code");
        }

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
            if (!err.response?.data?.securityStatus) {
                toast.error(err.response?.data?.message || "Invalid code");
            }
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
            setSetupStep("idle");
            toast.success("Two-Factor Authentication Disabled");
        } catch (err) {
            if (!err.response?.data?.securityStatus) {
                toast.error(err.response?.data?.message || "Failed to disable MFA");
            }
        }
    };

    const copyToClipboard = (text, message) => {
        navigator.clipboard.writeText(text);
        toast.info(message || "Copied to clipboard");
    };

    if (status === "loading") return <div className="p-4 bg-white rounded-xl border animate-pulse h-32"></div>;

    return (
        <div className="bg-white shadow-sm border rounded-xl p-6 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${status === "enabled" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        <FaShieldAlt className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                        <p className="text-sm text-gray-500">
                            Secure your account with an extra verification step.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider ${status === 'enabled' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {status === 'enabled' ? 'Active' : 'Inactive'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={status === "enabled"}
                            onChange={handleToggleMFA}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none ring-offset-2 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* Setup Progress */}
            {status === "disabled" && setupStep === "qr" && qrData && (
                <div className="mt-8 border-t pt-8 animate-fadeInUp">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">1</span>
                                <h4 className="font-bold text-gray-800 text-lg">Scan QR Code</h4>
                            </div>

                            <p className="text-sm text-gray-600">
                                Open Google Authenticator or any TOTP app and scan the code below.
                            </p>

                            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                                {!manualEntry ? (
                                    <>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                                            <QRCodeSVG
                                                value={qrData.otpauthUrl || `otpauth://totp/AutoVault?secret=${qrData.manualEntrySecret}`}
                                                size={180}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setManualEntry(true)}
                                            className="text-xs text-blue-600 font-medium hover:underline"
                                        >
                                            Can't scan? Use setup key
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full space-y-4">
                                        <div className="p-4 bg-white border rounded-xl">
                                            <p className="text-xs text-gray-400 mb-1 uppercase font-bold tracking-widest">Setup Key</p>
                                            <div className="flex items-center justify-between">
                                                <code className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{qrData.manualEntrySecret}</code>
                                                <button onClick={() => copyToClipboard(qrData.manualEntrySecret, "Secret copied")} className="text-gray-400 hover:text-blue-600 transition">
                                                    <FaCopy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setManualEntry(false)}
                                            className="text-xs text-blue-600 font-medium hover:underline w-full text-center"
                                        >
                                            Back to QR code
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">2</span>
                                <h4 className="font-bold text-gray-800 text-lg">Verify Setup</h4>
                            </div>

                            <p className="text-sm text-gray-600">
                                Enter the 6-digit code generated by your app.
                            </p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/[^0-9]/g, ""))}
                                        placeholder="000000"
                                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 text-center text-3xl font-bold tracking-[0.5em] focus:border-blue-500 focus:outline-none transition-colors"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handleVerifySetup}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
                                >
                                    Activate 2FA
                                </button>

                                <button
                                    onClick={() => {
                                        setSetupStep("idle");
                                        setQrData(null);
                                        setVerifyCode("");
                                    }}
                                    className="w-full text-gray-400 hover:text-gray-600 text-sm font-medium py-2"
                                >
                                    Cancel Setup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success View */}
            {setupStep === "success" && (
                <div className="mt-8 border-t pt-8 animate-fadeInUp">
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-100 flex items-start gap-4 mb-8">
                        <FaCheckCircle className="text-3xl text-green-500 mt-1" />
                        <div>
                            <h4 className="font-bold text-green-800 text-lg">2FA successfully activated!</h4>
                            <p className="text-sm text-green-600">
                                Your account is now more secure. Please save these backup codes in a safe place.
                            </p>
                        </div>
                    </div>

                    {backupCodes.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaKey className="text-gray-400" />
                                    <h5 className="font-bold text-gray-800">Backup Recovery Codes</h5>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(backupCodes.join('\n'), "All backup codes copied")}
                                    className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline"
                                >
                                    <FaCopy /> Copy All
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {backupCodes.map((code, index) => (
                                    <div key={index} className="bg-gray-50 border rounded-xl py-2 px-3 text-center font-mono text-sm font-bold text-gray-700 select-all hover:bg-white hover:border-blue-200 transition-all">
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-red-400 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                <FaTimes className="flex-shrink-0" />
                                <span>Note: These codes are shown only once. Lost codes cannot be recovered.</span>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setSetupStep("idle")}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl mt-8 font-bold transition-all shadow-lg"
                    >
                        I've saved the codes
                    </button>
                </div>
            )}

            {/* Status Information */}
            {setupStep === "idle" && (
                <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                            <FaMobileAlt size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">How it works</h4>
                            <p className="text-sm text-blue-800/70 mt-1 max-w-2xl leading-relaxed">
                                Once enabled, you'll be prompted for a 6-digit code from your authenticator app whenever you sign in. This ensures that only you can access your account, even if someone knows your password.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Disable Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeInUp">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                <FaShieldAlt size={28} />
                            </div>
                            <button onClick={() => setShowDisableModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        <h3 className="text-2xl font-black text-gray-900 mb-2">Disable Security?</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Removing Two-Factor Authentication will make your account significantly less secure. Are you sure you want to proceed?
                        </p>

                        <form onSubmit={handleDisableMFA} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Verify Password</label>
                                <input
                                    type="password"
                                    value={disablePassword}
                                    onChange={(e) => setDisablePassword(e.target.value)}
                                    className="w-full border-2 border-gray-100 rounded-2xl p-4 focus:border-red-500 focus:outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-red-100"
                                >
                                    Disable Security
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDisableModal(false)}
                                    className="w-full text-gray-500 hover:text-gray-700 font-bold py-2"
                                >
                                    Better keep it on
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
