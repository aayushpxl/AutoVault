import React, { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { userRegisterUserTan } from "../../hooks/useRegisterUserTan";

import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

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
      if (!email) toast.error("Email is empty");
      if (!username) toast.error("Username is empty");
      if (!pass) toast.error("Password is empty");
      if (!confirmPass) toast.error("Confirm password is empty");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Email must include @ (e.g., example@email.com)");
      return;
    }

    if (pass !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
    if (!passwordRegex.test(pass)) {
      toast.error(
        "Password must be 8-32 chars, include uppercase, lowercase, and one number"
      );
      return;
    }

    // Execute reCAPTCHA
    let recaptchaToken = "";
    try {
      recaptchaToken = await executeRecaptcha("register");
    } catch (error) {
      console.warn("ReCAPTCHA execution failed or not configured. Using bypass token for development.");
      recaptchaToken = "dev-bypass-token";
    }

    if (!recaptchaToken) {
      // Fallback if executeRecaptcha returns null but doesn't throw
      recaptchaToken = "dev-bypass-token";
    }

    const formData = {
      email,
      username,
      password: pass,
      recaptchaToken
    };

    mutate(formData);
  };

  return (
    <form className="w-full max-w-sm " onSubmit={handleSubmit}>
      {/* Username Field */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm font-medium mb-">
          Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="username"
            type="text"
            placeholder="Your username"
            className="w-full border rounded-lg p-3 pl-10 focus:outline-none text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="absolute left-3 top-3.5 text-gray-400 text-sm" />
        </div>
      </div>

      {/* Email Field */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            placeholder="demo@gmail.com"
            className="w-full border rounded-lg p-3 pl-10 focus:outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaEnvelope className="absolute left-3 top-3.5 text-gray-400 text-sm" />
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full border rounded-lg p-3 pl-10 pr-10 focus:outline-none text-sm"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 bg-transparent p-0 border-none shadow-none focus:outline-none"
          >
            {showPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Password must be 8-32 characters with upper, lower, & number
        </p>

        {/* Password Strength Indicator */}
        {pass && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Strength:</span>
              <span className={`text-xs font-bold ${(() => {
                const strength = [
                  /[a-z]/.test(pass),
                  /[A-Z]/.test(pass),
                  /\d/.test(pass),
                  /[@$!%*?&]/.test(pass),
                  pass.length >= 8 && pass.length <= 12
                ].filter(Boolean).length;
                if (strength <= 2) return "text-red-500";
                if (strength === 3 || strength === 4) return "text-yellow-500";
                return "text-green-500";
              })()
                }`}>
                {(() => {
                  const strength = [
                    /[a-z]/.test(pass),
                    /[A-Z]/.test(pass),
                    /\d/.test(pass),
                    pass.length >= 8 && pass.length <= 32
                  ].filter(Boolean).length;
                  if (strength <= 2) return "Weak";
                  if (strength === 3 || strength === 4) return "Medium";
                  return "Strong";
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${(() => {
                  const strength = [
                    /[a-z]/.test(pass),
                    /[A-Z]/.test(pass),
                    /\d/.test(pass),
                    pass.length >= 8 && pass.length <= 32
                  ].filter(Boolean).length;
                  if (strength <= 2) return "bg-red-500 w-1/3";
                  if (strength === 3 || strength === 4) return "bg-yellow-500 w-2/3";
                  return "bg-green-500 w-full";
                })()
                  }`}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="mb-3">
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3.5 text-gray-400 text-sm" />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full border rounded-lg p-3 pl-10 pr-10 focus:outline-none text-sm"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3.5 bg-transparent p-0 border-none shadow-none focus:outline-none"
          >
            {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 focus:outline-none text-sm"
        disabled={isPending}
      >
        {isPending ? "Registering..." : "Create Account"}
      </button>

      {isSuccess && <p className="text-green-600 text-sm text-center mt-3">{data.message}</p>}
      {isError && <p className="text-red-500 text-sm text-center mt-3">{error.message}</p>}

      <p className="text-xs text-gray-400 text-center mt-4">
        This site is protected by reCAPTCHA and the Google
        <a href="https://policies.google.com/privacy" className="text-blue-500 hover:underline"> Privacy Policy</a> and
        <a href="https://policies.google.com/terms" className="text-blue-500 hover:underline"> Terms of Service</a> apply.
      </p>
    </form>
  );
};

export default RegisterForm;
