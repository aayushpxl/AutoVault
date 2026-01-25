import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../hooks/admin/useAdminUser';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../../assets/logo.png";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    resetPassword(
      { token, password },
      {
        onSuccess: () => navigate('/login'),
        onError: (error) => console.error("Reset password failed:", error),
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <img src={Logo} alt="Gadi Khoj Logo" className="w-32 mx-auto" />
        <h2 className="text-2xl font-bold text-center text-gray-800">Set a New Password</h2>
        <p className="text-sm text-center text-gray-600">
          Your new password must be different from previously used passwords.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-blue-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Strength:</span>
                  <span
                    className={`text-xs font-bold ${(() => {
                      const strength = [
                        /[a-z]/.test(password),
                        /[A-Z]/.test(password),
                        /\d/.test(password),
                        /[@$!%*?&]/.test(password),
                        password.length >= 8 && password.length <= 12,
                      ].filter(Boolean).length;
                      if (strength <= 2) return "text-red-500";
                      if (strength === 3 || strength === 4) return "text-yellow-500";
                      return "text-green-500";
                    })()}`}
                  >
                    {(() => {
                      const strength = [
                        /[a-z]/.test(password),
                        /[A-Z]/.test(password),
                        /\d/.test(password),
                        password.length >= 8 && password.length <= 32,
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
                        /[a-z]/.test(password),
                        /[A-Z]/.test(password),
                        /\d/.test(password),
                        password.length >= 8 && password.length <= 32,
                      ].filter(Boolean).length;
                      if (strength <= 2) return "bg-red-500 w-1/3";
                      if (strength === 3 || strength === 4) return "bg-yellow-500 w-2/3";
                      return "bg-green-500 w-full";
                    })()}`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-blue-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {isPending ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
