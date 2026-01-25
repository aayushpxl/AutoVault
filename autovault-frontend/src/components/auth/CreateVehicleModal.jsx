import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useCreateVehicle } from "../../hooks/admin/useAdminVehicle";

const validationSchema = Yup.object({
  vehicleName: Yup.string().required("Vehicle name is required"),
  vehicleType: Yup.string().required("Vehicle type is required"),
  fuelCapacityLitres: Yup.number()
    .required("Fuel capacity is required")
    .positive("Must be positive"),
  loadCapacityKg: Yup.number()
    .required("Load capacity is required")
    .positive("Must be positive"),
  passengerCapacity: Yup.number()
    .required("Passenger capacity is required")
    .min(1, "Must be at least 1"),
  pricePerTrip: Yup.number()
    .required("Price is required")
    .min(0, "Price must be at least 0"),
  vehicleDescription: Yup.string().required("Description is required"),
  image: Yup.mixed().required("Image is required"),
});

const CreateVehicleModal = ({ showModal, onClose }) => {
  const { mutateAsync: createVehicle } = useCreateVehicle();

  const formik = useFormik({
    initialValues: {
      vehicleName: "",
      vehicleType: "",
      fuelCapacityLitres: "",
      loadCapacityKg: "",
      passengerCapacity: "",
      pricePerTrip: "",
      vehicleDescription: "", 
      image: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      const vehicle = {
        vehicleName: values.vehicleName,
        vehicleType: values.vehicleType,
        fuelCapacityLitres: Number(values.fuelCapacityLitres),
        loadCapacityKg: Number(values.loadCapacityKg),
        passengerCapacity: Number(values.passengerCapacity),
        pricePerTrip: Number(values.pricePerTrip),
        vehicleDescription: values.vehicleDescription, 
      };

      formData.append("vehicle", JSON.stringify(vehicle));
      formData.append("image", values.image);

      try {
        await createVehicle(formData);
        resetForm();
        onClose();
      } catch (err) {
        console.error(err);
      }
    },
  });

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Add Vehicle</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {[
            { name: "vehicleName", type: "text", placeholder: "Vehicle Name" },
            { name: "vehicleType", type: "text", placeholder: "Vehicle Type" },
            { name: "fuelCapacityLitres", type: "number", placeholder: "Fuel Capacity (L)" },
            { name: "loadCapacityKg", type: "number", placeholder: "Load Capacity (Kg)" },
            { name: "passengerCapacity", type: "number", placeholder: "Passenger Capacity" },
            { name: "pricePerTrip", type: "number", placeholder: "Price per Trip" },
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
            </div>
          ))}

          {/*  Vehicle Description */}
          <div>
            <textarea
              name="vehicleDescription"
              placeholder="Vehicle Description"
              value={formik.values.vehicleDescription}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border p-2 rounded h-24"
            />
            {formik.touched.vehicleDescription && formik.errors.vehicleDescription && (
              <div className="text-red-500 text-sm">{formik.errors.vehicleDescription}</div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => formik.setFieldValue("image", e.currentTarget.files[0])}
              onBlur={formik.handleBlur}
              className="w-full"
            />
            {formik.touched.image && formik.errors.image && (
              <div className="text-red-500 text-sm">{formik.errors.image}</div>
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
              {formik.isSubmitting ? "Submitting..." : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVehicleModal;
