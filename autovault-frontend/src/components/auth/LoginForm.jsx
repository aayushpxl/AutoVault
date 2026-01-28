import React, { useState, useEffect, useContext, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoginUser } from "../../hooks/useLoginUser";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
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
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
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
          if (responseData.requiresTwoFactor) {
            setMfaData(responseData);
            setViewState("mfa");
            toast.info(responseData.message || "2FA Verification Required");
            recaptchaRef.current?.reset();
            return;
          }

          if (responseData.requiresVerification) {
            setUnverifiedEmail(values.email);
            setViewState("unverified");
            recaptchaRef.current?.reset();
            return;
          }
        },
        onError: (err) => {
          if (err.requiresVerification) {
            setUnverifiedEmail(values.email);
            setViewState("unverified");
            recaptchaRef.current?.reset();
          } else {
            recaptchaRef.current?.reset();
          }
        }
      });
    },
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
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
    <div className="w-full max-w-[420px] bg-white p-5 rounded-2xl shadow-xl border border-slate-100">

      {viewState === "login" && (
        <>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="text"
                name="email"
                placeholder="john@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full bg-white border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-slate-300'} text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full bg-white border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-slate-300'} text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-12 outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-icon-only absolute inset-y-0 right-2 flex items-center justify-center w-10 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-500 mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="remember-me" className="ml-2 text-sm font-medium text-slate-600">Remember me</label>
              </div>
              <span
                onClick={() => setShowForgotModal(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Forgot password?
              </span>
            </div>

            <div className="mb-4 flex justify-center bg-gray-50 p-2 rounded-lg border border-gray-100">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                size="normal"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-3.5 text-center transition-all shadow-lg shadow-blue-700/20"
            >
              {isPending ? "Logging in..." : "Login"}
            </button>

            {/* Error Message */}
            {error && !error.requiresVerification && !error.securityStatus && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error.message}</p>
                </div>
              </div>
            )}

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="px-3 text-sm text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-4 focus:outline-none focus:ring-slate-100 font-medium rounded-lg text-sm px-5 py-3.5 text-center transition-all">
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>

            <p className="text-sm font-medium text-slate-500 text-center mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-700 hover:underline font-bold">
                Sign up
              </Link>
            </p>
          </form>
        </>
      )}

      {/* Other Views (MFA, Unverified, Forgot Pass) kept simple but wrapper matching style */}
      {viewState === "mfa" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Two-Factor Authentication</h2>
          <p className="text-slate-500 mb-6 text-sm">Enter the code to verify your identity.</p>
          <form onSubmit={handleMfaVerify} className="space-y-4">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.trim())}
              className="w-full text-center text-2xl tracking-[0.5em] p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              maxLength={6}
              autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Verify</button>
            <button type="button" onClick={() => setViewState("login")} className="text-sm text-slate-500 hover:underline">Back to login</button>
          </form>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-fadeInUp">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
            <p className="text-slate-500 text-sm mb-6">Enter your email to receive extraction instructions.</p>
            <form onSubmit={handleForgotSubmit}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-6"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  {isSendingReset ? "Sending..." : "Send Link"}
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
