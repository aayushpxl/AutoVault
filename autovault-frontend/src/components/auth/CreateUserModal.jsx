import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useCreateUser } from "../../hooks/admin/useAdminUser";

const validationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,32}$/,
      "Password must be 8-32 chars, with upper, lower, & number"
    )
    .required("Password is required"),
  role: Yup.string().oneOf(["admin", "normal"], "Invalid role").required("Role is required"),
});

const CreateUserModal = ({ showModal, onClose }) => {
  const { mutateAsync: createUser } = useCreateUser();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      role: "normal",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createUser(values);
        toast.success("User created successfully");
        resetForm();
        onClose();
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to create user");
      }
    },
  });

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Add User</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {[
            { name: "username", type: "text", placeholder: "Username" },
            { name: "email", type: "email", placeholder: "Email" },
            { name: "password", type: "password", placeholder: "Password" },
          ].map((field) => (
            <div key={field.name}>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border p-2 rounded"
              />
              {formik.touched[field.name] && formik.errors[field.name] && (
                <div className="text-red-500 text-sm">{formik.errors[field.name]}</div>
              )}

              {/* Password Strength Indicator */}
              {field.name === "password" && formik.values.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Strength:</span>
                    <span className={`text-xs font-bold ${(() => {
                      const pass = formik.values.password;
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
                        const pass = formik.values.password;
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
                        const pass = formik.values.password;
                        const strength = [
                          /[a-z]/.test(pass),
                          /[A-Z]/.test(pass),
                          /\d/.test(pass),
                          /[@$!%*?&]/.test(pass),
                          pass.length >= 8 && pass.length <= 12
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
          ))}

          <div>
            <select
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-2 rounded"
            >
              <option value="normal">Normal</option>
              <option value="admin">Admin</option>
            </select>
            {formik.touched.role && formik.errors.role && (
              <div className="text-red-500 text-sm">{formik.errors.role}</div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {formik.isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
