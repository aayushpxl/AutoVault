import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUpdateVehicle, useGetOneVehicle } from "../../hooks/admin/useAdminVehicle";

export default function UpdateVehicleModal({ vehicleId, showModal, onClose, onSuccess }) {
  const { vehicle, isLoading, error } = useGetOneVehicle(vehicleId);
  const updateVehicle = useUpdateVehicle();

  const validationSchema = Yup.object({
    vehicleName: Yup.string().required("Vehicle name is required"),
    vehicleType: Yup.string().required("Vehicle type is required"),
    fuelCapacityLitres: Yup.number().required("Fuel capacity is required").positive(),
    loadCapacityKg: Yup.number().required("Load capacity is required").positive(),
    passengerCapacity: Yup.string().required("Passenger capacity is required"),
    pricePerTrip: Yup.number().required("Price per trip is required").positive(),
    vehicleDescription: Yup.string().required("Description is required"), // ✅ Added
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      vehicleName: vehicle?.vehicleName || "",
      vehicleType: vehicle?.vehicleType || "",
      fuelCapacityLitres: vehicle?.fuelCapacityLitres || "",
      loadCapacityKg: vehicle?.loadCapacityKg || "",
      passengerCapacity: vehicle?.passengerCapacity || "",
      pricePerTrip: vehicle?.pricePerTrip || "",
      vehicleDescription: vehicle?.vehicleDescription || "", // ✅ Added
      imageFile: null,
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      const formData = new FormData();
      formData.append("vehicleName", values.vehicleName);
      formData.append("vehicleType", values.vehicleType);
      formData.append("fuelCapacityLitres", values.fuelCapacityLitres);
      formData.append("loadCapacityKg", values.loadCapacityKg);
      formData.append("passengerCapacity", values.passengerCapacity);
      formData.append("pricePerTrip", values.pricePerTrip);
      formData.append("vehicleDescription", values.vehicleDescription); // ✅ Added
      if (values.imageFile) {
        formData.append("image", values.imageFile);
      }

      updateVehicle.mutate(
        { id: vehicleId, data: formData },
        {
          onSuccess: () => {
            toast.success("Vehicle updated successfully");
            onClose();
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            toast.error(err?.message || "Failed to update vehicle");
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
      <div className="bg-white p-6 rounded-md shadow-md w-[450px] max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Update Vehicle</h2>

        {isLoading ? (
          <p>Loading vehicle data...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load vehicle data</p>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {[
              { name: "vehicleName", label: "Vehicle Name", type: "text" },
              { name: "vehicleType", label: "Vehicle Type", type: "text" },
              { name: "fuelCapacityLitres", label: "Fuel Capacity (Litres)", type: "number" },
              { name: "loadCapacityKg", label: "Load Capacity (Kg)", type: "number" },
              { name: "passengerCapacity", label: "Passenger Capacity", type: "text" },
              { name: "pricePerTrip", label: "Price per Trip", type: "number" },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block mb-1">{label}</label>
                <input
                  name={name}
                  type={type}
                  className="w-full border p-2 rounded"
                  value={formik.values[name]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched[name] && formik.errors[name] && (
                  <div className="text-red-500 text-sm">{formik.errors[name]}</div>
                )}
              </div>
            ))}

            {/* ✅ Vehicle Description */}
            <div>
              <label className="block mb-1">Description</label>
              <textarea
                name="vehicleDescription"
                className="w-full border p-2 rounded h-24"
                value={formik.values.vehicleDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.vehicleDescription && formik.errors.vehicleDescription && (
                <div className="text-red-500 text-sm">{formik.errors.vehicleDescription}</div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block mb-1">Upload New Image (optional)</label>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  formik.setFieldValue("imageFile", event.currentTarget.files[0]);
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded"
                disabled={updateVehicle.isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting || updateVehicle.isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {updateVehicle.isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
