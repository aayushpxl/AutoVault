import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EditProfile = ({ initialData, onSave, isPending, onCancel }) => {
  const [formData, setFormData] = useState(initialData);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    // Clear passwords on initialData change
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  }, [initialData]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // New validation: if any password field filled, all must be filled
    if (
      currentPassword.length > 0 ||
      newPassword.length > 0 ||
      confirmPassword.length > 0
    ) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setError("Please fill out all password fields to change your password.");
        return;
      }
    }

    if (newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/;
      if (!passwordRegex.test(newPassword)) {
        setError("New password must be 8-32 characters with upper, lower, & number");
        return;
      }
      if (newPassword === currentPassword) {
        setError("New password cannot be the same as your current password.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match.");
        return;
      }
    }

    const payload = {
      ...formData,
      ...(newPassword ? { currentPassword, newPassword } : {}),
    };

    onSave(payload);
  };

  // Function to check if form is changed
  const isFormChanged = () => {
    // List of fields that can be edited in the main form
    const editableFields = ["username", "email", "phone", "bio"];

    // Check if any main form field changed, handling potential null/undefined
    const formFieldsChanged = editableFields.some(
      (key) => (formData[key] || "") !== (initialData?.[key] || "")
    );

    // Check if any password field is filled
    const passwordChanged =
      currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

    return formFieldsChanged || passwordChanged;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto mt-10 px-4 md:px-8 space-y-12"
    >
      {/* Header with Cancel button */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Edit Profile</h1>
          {formData?.createdAt && (
            <p className="text-sm text-gray-500 mt-1">
              Joined on{" "}
              {new Date(formData.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-black px-4 py-2 transition"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* About Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-medium text-gray-800">About</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              placeholder="+1 234 567 890"
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio || ""}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 resize-none"
            />
            <div className="flex justify-end">
              <span className={`text-xs ${formData.bio?.length >= 450 ? "text-red-500" : "text-gray-500"}`}>
                {formData.bio?.length || 0}/500
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Password Section */}
      <section className="space-y-6 border-t pt-10">
        <h2 className="text-lg font-medium text-gray-800">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black focus:outline-none bg-transparent p-0 border-none shadow-none hover:shadow-none transform-none hover:transform-none"
              >
                {showCurrentPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black focus:outline-none bg-transparent p-0 border-none shadow-none hover:shadow-none transform-none hover:transform-none"
              >
                {showNewPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-2 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">Strength:</span>
                  <span
                    className={`text-xs font-bold ${(() => {
                      const strength = [
                        /[a-z]/.test(newPassword),
                        /[A-Z]/.test(newPassword),
                        /\d/.test(newPassword),
                        /[@$!%*?&]/.test(newPassword),
                        newPassword.length >= 8 && newPassword.length <= 12,
                      ].filter(Boolean).length;
                      if (strength <= 2) return "text-red-500";
                      if (strength === 3 || strength === 4) return "text-yellow-500";
                      return "text-green-500";
                    })()}`}
                  >
                    {(() => {
                      const strength = [
                        /[a-z]/.test(newPassword),
                        /[A-Z]/.test(newPassword),
                        /\d/.test(newPassword),
                        newPassword.length >= 8 && newPassword.length <= 32,
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
                        /[a-z]/.test(newPassword),
                        /[A-Z]/.test(newPassword),
                        /\d/.test(newPassword),
                        newPassword.length >= 8 && newPassword.length <= 32,
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 focus:outline-none focus:border-black py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-0 bottom-2 text-gray-400 hover:text-black focus:outline-none bg-transparent p-0 border-none shadow-none hover:shadow-none transform-none hover:transform-none"
              >
                {showConfirmPassword ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error message inside Change Password section */}
        {error && (
          <p className="text-red-600 text-sm font-medium mt-2">{error}</p>
        )}
      </section>

      {/* Save Changes Button at bottom */}
      <section className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={isPending || !isFormChanged()}
          className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </section>
    </form>
  );
};

export default EditProfile;
