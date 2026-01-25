import React from "react";
import { useFormik } from "formik"; // <--- Add this line
import { toast } from "react-toastify";
import { useCreateVehicle } from "../../hooks/admin/useAdminVehicle";

const CreateVehicleForm = () => {
  const formik = useFormik({
    initialValues: {
      vehicleName: "",
      vehicleType: "",
      fuelCapacityLitres: "",
      loadCapacityKg: "",
      passengerCapacity: "",
      pricePerTrip: "",
      image: null,
    },
    onSubmit: async (values) => {
      const formData = new FormData();

      const vehicle = {
        vehicleName: values.vehicleName,
        vehicleType: values.vehicleType,
        fuelCapacityLitres: Number(values.fuelCapacityLitres),
        loadCapacityKg: Number(values.loadCapacityKg),
        passengerCapacity: values.passengerCapacity,
        pricePerTrip: Number(values.pricePerTrip),
      };

      formData.append("vehicle", JSON.stringify(vehicle));
      if (values.image) {
        formData.append("file", values.image);
      }

      try {
        const res = await fetch("/api/admin/vehicles", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          toast.success("Vehicle added successfully");
          formik.resetForm();
        } else {
          toast.error(data.message || "Failed to add vehicle");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <input
        type="text"
        name="vehicleName"
        placeholder="Vehicle Name"
        value={formik.values.vehicleName}
        onChange={formik.handleChange}
        required
      />
      <input
        type="text"
        name="vehicleType"
        placeholder="Vehicle Type"
        value={formik.values.vehicleType}
        onChange={formik.handleChange}
        required
      />
      <input
        type="number"
        name="fuelCapacityLitres"
        placeholder="Fuel Capacity (Litres)"
        value={formik.values.fuelCapacityLitres}
        onChange={formik.handleChange}
        required
      />
      <input
        type="number"
        name="loadCapacityKg"
        placeholder="Load Capacity (Kg)"
        value={formik.values.loadCapacityKg}
        onChange={formik.handleChange}
        required
      />
      <input
        type="text"
        name="passengerCapacity"
        placeholder="Passenger Capacity"
        value={formik.values.passengerCapacity}
        onChange={formik.handleChange}
        required
      />
      <input
        type="number"
        name="pricePerTrip"
        placeholder="Price per Trip"
        value={formik.values.pricePerTrip}
        onChange={formik.handleChange}
        required
      />
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={(e) =>
          formik.setFieldValue("image", e.currentTarget.files[0])
        }
      />
      <button type="submit">Add Vehicle</button>
    </form>
  );
};

export default CreateVehicleForm;