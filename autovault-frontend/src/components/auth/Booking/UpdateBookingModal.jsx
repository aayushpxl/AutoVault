import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUpdateBooking } from "../../../hooks/useBooking"; // Adjust path as needed
import { useGetOneBooking } from "../../../hooks/useBooking"; // You need this hook to fetch individual booking

export default function UpdateBookingModal({ bookingId, showModal, onClose, onSuccess }) {
  console.log("Booking ID received in modal:", bookingId);  
  const { booking, isLoading, error } = useGetOneBooking(bookingId);
  const updateBooking = useUpdateBooking();

  const validationSchema = Yup.object({
    pickupLocation: Yup.string().required("Pickup location is required"),
    dropoffLocation: Yup.string().required("Dropoff location is required"),
    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date()
      .min(Yup.ref("startDate"), "End date must be after start date")
      .required("End date is required"),
    status: Yup.string().oneOf(["pending", "confirmed", "cancelled"], "Invalid status"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      pickupLocation: booking?.pickupLocation || "",
      dropoffLocation: booking?.dropoffLocation || "",
      startDate: booking?.startDate?.split("T")[0] || "",
      endDate: booking?.endDate?.split("T")[0] || "",
      status: booking?.status || "pending",
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      updateBooking.mutate(
        { id: bookingId, updatedData: values },
        {
          onSuccess: () => {
            toast.success("Booking updated successfully");
            onClose();
            if (onSuccess) onSuccess();
          },
          onError: (err) => {
            toast.error(err?.message || "Failed to update booking");
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
        <h2 className="text-xl font-semibold mb-4">Update Booking</h2>

        {isLoading ? (
          <p>Loading booking data...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load booking data</p>
        ) : (
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Pickup Location */}
            <div>
              <label className="block mb-1">Pickup Location</label>
              <input
                name="pickupLocation"
                type="text"
                className="w-full border p-2 rounded"
                value={formik.values.pickupLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.pickupLocation && formik.errors.pickupLocation && (
                <div className="text-red-500 text-sm">{formik.errors.pickupLocation}</div>
              )}
            </div>

            {/* Dropoff Location */}
            <div>
              <label className="block mb-1">Dropoff Location</label>
              <input
                name="dropoffLocation"
                type="text"
                className="w-full border p-2 rounded"
                value={formik.values.dropoffLocation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.dropoffLocation && formik.errors.dropoffLocation && (
                <div className="text-red-500 text-sm">{formik.errors.dropoffLocation}</div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block mb-1">Start Date</label>
              <input
                name="startDate"
                type="date"
                className="w-full border p-2 rounded"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.startDate && formik.errors.startDate && (
                <div className="text-red-500 text-sm">{formik.errors.startDate}</div>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                className="w-full border p-2 rounded"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.endDate && formik.errors.endDate && (
                <div className="text-red-500 text-sm">{formik.errors.endDate}</div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1">Status</label>
              <select
                name="status"
                className="w-full border p-2 rounded"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {formik.touched.status && formik.errors.status && (
                <div className="text-red-500 text-sm">{formik.errors.status}</div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 px-4 py-2 rounded"
                disabled={updateBooking.isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting || updateBooking.isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {updateBooking.isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
