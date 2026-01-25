import React, { useState, useEffect } from "react";
import { useLoggedInUser, useUpdateLoggedInUser } from "../../hooks/admin/useAdminUser";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

const AdminProfilePage = () => {
  const { data, isLoading, isError } = useLoggedInUser();
  const updateProfile = useUpdateLoggedInUser();

  const [initialValues, setInitialValues] = useState({
    email: "",
    phone: "",
    username: "",
    createdAt: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (data?.data) {
      setInitialValues({
        email: data.data.email || "",
        phone: data.data.phone || "",
        username: data.data.username || "",
        createdAt: data.data.createdAt || "",
      });
    }
  }, [data]);

  const validationSchema = Yup.object({
    phone: Yup.string().nullable(),
  });

  const handleSubmit = (values) => {
    const { phone } = values; // only send editable fields
    updateProfile.mutate({ phone }, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update profile");
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  if (isLoading) return <p>Loading profile...</p>;
  if (isError) return <p>Error loading profile</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Admin Profile</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Summary */}
        <div className="bg-white shadow p-6 rounded-lg flex flex-col items-center">
          {/* First Letter Avatar */}
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
            {initialValues.username ? initialValues.username.charAt(0).toUpperCase() : "A"}
          </div>

          {/* Username */}
          <h3 className="mt-4 text-xl font-semibold">@{initialValues.username || "N/A"}</h3>

          {/* Account Creation Date */}
          <p className="text-gray-400 text-sm mt-2">
            Account Created:{" "}
            {initialValues.createdAt
              ? new Date(initialValues.createdAt).toLocaleDateString()
              : "N/A"}
          </p>

          {/* Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Right: Editable Form */}
        <div className="bg-white shadow p-6 rounded-lg md:col-span-2">
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {/* Username (Non-editable) */}
                <div>
                  <label className="block font-medium text-gray-600">Username</label>
                  <Field
                    name="username"
                    type="text"
                    disabled
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                  />
                </div>

                {/* Email (Non-editable) */}
                <div>
                  <label className="block font-medium text-gray-600">Email</label>
                  <Field
                    name="email"
                    type="email"
                    disabled
                    className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium text-gray-600">Phone</label>
                  <Field
                    name="phone"
                    type="text"
                    disabled={!isEditing}
                    className={`w-full border-b border-gray-300 focus:border-blue-500 outline-none py-1 bg-transparent ${
                      !isEditing ? "text-gray-500 cursor-not-allowed" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                {/* Save + Cancel Buttons */}
                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || updateProfile.isPending}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      {updateProfile.isPending ? "Updating..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
