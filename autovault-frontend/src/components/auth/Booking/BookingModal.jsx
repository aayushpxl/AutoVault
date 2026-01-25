import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/Api";

const validationSchema = Yup.object({
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().required("End date is required"),
  pickupLocation: Yup.string().required("Pickup location is required"),
  dropLocation: Yup.string().required("Drop location is required"),
});

const createBookingService = async (data) => {
  const res = await axios.post("bookings", data);
  return res.data;
};

const BookingModal = ({ showModal, onClose, vehicle }) => {
  const queryClient = useQueryClient();
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  const { mutateAsync: createBooking } = useMutation({
    mutationFn: createBookingService,
    onSuccess: () => {
      toast.success("Booking successful!");
      queryClient.invalidateQueries(["user_bookings"]);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Booking failed");
    },
  });

  const formik = useFormik({
    initialValues: {
      startDate: "",
      endDate: "",
      pickupLocation: "",
      dropLocation: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const { startDate, endDate, pickupLocation, dropLocation } = values;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
          toast.error("Invalid booking duration");
          return;
        }

        const pickupFee = pickupLocation !== "default" ? 500 : 0;
        const dropFee = dropLocation !== "default" ? 300 : 0;

        const totalPrice = days * vehicle.pricePerTrip + pickupFee + dropFee;

        await createBooking({
          vehicleId: vehicle._id,
          startDate: start,
          endDate: end,
          pickupLocation,
          dropLocation,
          totalPrice,
        });

        resetForm();
      } catch (err) {
        console.error(err);
      }
    },
  });

  // Auto-calculate total price when relevant fields change
  useEffect(() => {
    const { startDate, endDate, pickupLocation, dropLocation } = formik.values;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      const pickupFee = pickupLocation !== "default" ? 500 : 0;
      const dropFee = dropLocation !== "default" ? 300 : 0;

      if (days > 0 && vehicle) {
        const total = days * vehicle.pricePerTrip + pickupFee + dropFee;
        setCalculatedTotal(total);
      } else {
        setCalculatedTotal(0);
      }
    } else {
      setCalculatedTotal(0);
    }
  }, [formik.values, vehicle]);

  if (!showModal || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold">Book {vehicle.vehicleName}</h2>

        <p className="text-sm text-gray-700">
          <span className="font-medium">Price per trip:</span> NPR {vehicle.pricePerTrip}
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {["startDate", "endDate"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-700 capitalize">{field}</label>
              <input
                type="date"
                name={field}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border p-2 rounded"
              />
              {formik.touched[field] && formik.errors[field] && (
                <div className="text-red-500 text-sm">{formik.errors[field]}</div>
              )}
            </div>
          ))}

          {["pickupLocation", "dropLocation"].map((field) => (
            <div key={field}>
              <input
                type="text"
                name={field}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={formik.values[field]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border p-2 rounded"
              />
              {formik.touched[field] && formik.errors[field] && (
                <div className="text-red-500 text-sm">{formik.errors[field]}</div>
              )}
            </div>
          ))}

          {/* Total Price Display */}
          <div className="text-right text-sm font-medium text-gray-700">
            Total Price:{" "}
            <span className="text-green-600 font-semibold">
              NPR {calculatedTotal > 0 ? calculatedTotal : "—"}
            </span>
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              {formik.isSubmitting ? "Booking..." : "Book Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
