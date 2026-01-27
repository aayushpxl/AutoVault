import React, { useState, useEffect, useContext, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from "../../hooks/useLoginUser";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Logo from "../../assets/autovaultlogo.png";
import { AuthContext } from "../../auth/AuthProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSendResetLink } from "../../hooks/admin/useAdminUser";
import ReCAPTCHA from "react-google-recaptcha";
import { verifyMFALoginApi, resendVerificationApi } from "../../api/authApi";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const recaptchaRef = useRef(null);

  // New state for MFA and Verification
  const [viewState, setViewState] = useState("login"); // login, mfa, unverified
  const [mfaData, setMfaData] = useState(null);
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const { mutate, data, error, isPending, isSuccess } = useLoginUser();
  const { mutate: sendResetLink, isPending: isSendingReset } = useSendResetLink();

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Get reCAPTCHA token from checkbox
      const recaptchaToken = recaptchaRef.current?.getValue();

      if (!recaptchaToken) {
        toast.error("Please complete the reCAPTCHA verification");
        return;
      }

      mutate({ ...values, recaptchaToken }, {
        onSuccess: (responseData) => {
          // Check for MFA requirement
          if (responseData.requiresTwoFactor) {
            setMfaData(responseData);
            setViewState("mfa");
            toast.info(responseData.message || "2FA Verification Required");
            // Reset reCAPTCHA since we might need it again if we go back
            recaptchaRef.current?.reset();
            return;
          }

          // Check for unverified email (should be caught by onError usually, but just in case)
          if (responseData.requiresVerification) {
            setUnverifiedEmail(values.email);
            setViewState("unverified");
            recaptchaRef.current?.reset();
            return;
          }
        },
        onError: (err) => {
          // Handle 403 Unverified Email
          if (err.requiresVerification) {
            setUnverifiedEmail(values.email);
            setViewState("unverified");
            recaptchaRef.current?.reset();
          } else {
            // Standard error
            recaptchaRef.current?.reset();
          }
        }
      });
    },
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
      // Backend uses HttpOnly cookies, so token might not be in body. 
      // We pass a placeholder if missing to satisfy AuthProvider's localStorage check.
      login(data.data, data.token || "secure-cookie-session");
      toast.success(data.message || "Login successful");

      if (data.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.data.role === "normal") {
        navigate("/home");
      } else {
        navigate("/");
      }
    }
  }, [isSuccess, data, login, navigate]);

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Please enter your email");

    sendResetLink(forgotEmail, {
      onSuccess: () => {
        setShowForgotModal(false);
        setForgotEmail("");
      },
    });
  };

  // Handle MFA Verification
  const handleMfaVerify = async (e) => {
    e.preventDefault();
    if (!mfaCode) return toast.error("Please enter the code");

    setIsVerifyingMFA(true);
    try {
      const response = await verifyMFALoginApi({
        userId: mfaData.userId,
        code: mfaCode
      });

      const loginData = response.data;
      login(loginData.data, loginData.token);
      toast.success("Login successful!");

      if (loginData.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (loginData.data.role === "normal") {
        navigate("/home");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid code");
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  // Handle Resend Verification
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerificationApi({ email: unverifiedEmail });
      toast.success("Verification email sent! Check your inbox.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-sm relative">
      <img src={Logo} alt="Gadi Khoj Logo" className="w-40 mb-6" />

      {/* LOGIN VIEW */}
      {viewState === "login" && (
        <>
          <h2 className="text-3xl font-bold mb-8">Login to get started</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="demo@gmail.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className={`w-full border rounded-lg p-3 pl-10 focus:outline-none ${formik.touched.email && formik.errors.email ? "border-red-500" : ""
                    }`}
                />
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="demopassword123"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full border rounded-lg p-3 pl-10 pr-10 focus:outline-none ${formik.touched.password && formik.errors.password ? "border-red-500" : ""
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 bg-transparent p-0 border-none shadow-none focus:outline-none"
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <p className="text-xs text-gray-500">At least 6 characters</p>
                <p
                  onClick={() => setShowForgotModal(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </p>

              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* reCAPTCHA v2 Checkbox */}
            <div className="mb-4 flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                theme="light"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-6 transition duration-300 focus:outline-none"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-700 mb-5">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create account
            </Link>
          </p>

          <div className="text-center text-sm text-gray-400 mb-6">or</div>

          <button className="w-full border border-gray-300 py-3 flex items-center justify-center gap-3 rounded-lg hover:bg-gray-100 transition duration-300">
            <FcGoogle className="text-2xl" /> Sign up with Google
          </button>
        </>
      )}

      {/* MFA VIEW */}
      {viewState === "mfa" && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-600 mb-6">
            {mfaData?.mfaMethod === 'totp'
              ? "Please enter the code from your authenticator app."
              : "Please enter the verification code sent to your email."}
          </p>

          <form onSubmit={handleMfaVerify}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Verification Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.trim())}
                  className="w-full border rounded-lg p-3 pl-10 focus:outline-none text-center tracking-widest text-xl font-mono"
                  autoFocus
                  maxLength={6}
                />
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingMFA}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-4 transition duration-300 focus:outline-none"
            >
              {isVerifyingMFA ? "Verifying..." : "Verify Login"}
            </button>

            <button
              type="button"
              onClick={() => setViewState("login")}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Back to Login
            </button>
          </form>
        </div>
      )}

      {/* UNVERIFIED EMAIL VIEW */}
      {viewState === "unverified" && (
        <div className="animate-fade-in text-center px-4">
          <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Email Verification Required</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your email address <strong>{unverifiedEmail}</strong> has not been verified yet.
            Please check your inbox for the verification link.
          </p>

          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-4 transition duration-300 focus:outline-none"
          >
            {isResending ? "Sending..." : "Resend Verification Email"}
          </button>

          <button
            type="button"
            onClick={() => setViewState("login")}
            className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      )}

      {/* Generic Error/Success Messages not handled by views */}
      {viewState === "login" && error && !error.requiresVerification && (
        <p className="text-center text-sm text-red-600 mt-4">{error.message}</p>
      )}
      {viewState === "login" && isSuccess && data?.message && !data.requiresTwoFactor && (
        <p className="text-center text-sm text-green-600 mt-4">{data.message}</p>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
            <p className="text-sm text-gray-600 mb-4">
              Enter your registered email and we’ll send you a reset link.
            </p>
            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  {isSendingReset ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
