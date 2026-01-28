import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { userRegisterUserTan } from "../../hooks/useRegisterUserTan";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { FcGoogle } from "react-icons/fc";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [username, setUsername] = useState("");

  const { executeRecaptcha } = useGoogleReCaptcha();
  const { mutate, data, error, isPending, isSuccess, isError } = userRegisterUserTan();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !username || !pass || !confirmPass) {
      toast.error("Please fill in all fields");
      return;
    }

    if (pass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    // Attempt reCAPTCHA
    let recaptchaToken = "bypass-token"; // Default for dev if key missing
    try {
      const token = await executeRecaptcha("register");
      if (token) recaptchaToken = token;
    } catch (err) {
      console.log("Recaptcha bypassed/failed");
    }

    mutate({ email, username, password: pass, recaptchaToken });
  };

  return (
    <div className="w-full max-w-[420px] bg-white p-5 rounded-2xl shadow-xl border border-slate-100">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
        <p className="text-slate-500 text-sm">Join us today and start your journey</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
          <input
            type="text"
            placeholder="johndoe123"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-12 outline-none transition-all"
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
          {/* Simple strength bar */}
          {pass && (
            <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${pass.length < 8 ? "bg-red-500 w-1/3" : "bg-green-500 w-full"}`}></div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-12 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="btn-icon-only absolute inset-y-0 right-2 flex items-center justify-center w-10 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-5 py-3.5 text-center transition-all shadow-lg shadow-blue-700/20"
        >
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>

        {isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center">
            {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg text-center font-semibold">
            {data.message || "Account created successfully!"}
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
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 hover:underline font-bold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
