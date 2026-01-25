import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUpdateOneUser, useGetOneUser } from "../../hooks/admin/useAdminUser";

export default function UpdateUserModal({ userId, showModal, onClose, onSuccess }) {
  const updateUserHook = useUpdateOneUser();
  const { user, isPending, error } = useGetOneUser(userId); // ✅ fixed destructuring

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    role: Yup.string().oneOf(["admin", "normal"]).required("Role is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "normal",
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      updateUserHook.mutate(
        { id: userId, data: values },
        {
          onSuccess: () => {
            toast.success("User updated successfully");
            onClose();
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            toast.error(err?.message || "Failed to update user");
          },
          onSettled: () => {
            setSubmitting(false);
          },
        }
      );
    },
  });

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-md w-[400px]">
        <h2 className="text-xl font-semibold mb-4">Update User</h2>

        {isPending ? (
          <p>Loading user...</p>
        ) : error ? (
          <p className="text-red-500">Error loading user</p>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Username</label>
              <input
                name="username"
                type="text"
                className="w-full border p-2 rounded"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
              {formik.touched.username && formik.errors.username && (
                <div className="text-red-500 text-sm">{formik.errors.username}</div>
              )}
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input
                name="email"
                type="email"
                className="w-full border p-2 rounded"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm">{formik.errors.email}</div>
              )}
            </div>

            <div>
              <label className="block mb-1">Role</label>
              <select
                name="role"
                className="w-full border p-2 rounded"
                value={formik.values.role}
                onChange={formik.handleChange}
              >
                <option value="normal">Normal</option>
                <option value="admin">Admin</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <div className="text-red-500 text-sm">{formik.errors.role}</div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {formik.isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
