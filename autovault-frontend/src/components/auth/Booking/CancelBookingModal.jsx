import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/Api";

export default function CancelBookingModal({ bookingId, onClose }) {
  const queryClient = useQueryClient();

  const cancelBooking = useMutation({
    mutationFn: () => axios.patch(`/bookings/${bookingId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries(["user_bookings"]);
      onClose();
    },
    onError: (err) => alert("Failed to cancel: " + err.message),
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 z-50 w-96 max-w-full bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
        <h2 className="text-xl font-semibold mb-4">Cancel Booking?</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to cancel this booking?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={() => cancelBooking.mutate()}
            disabled={cancelBooking.isLoading}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {cancelBooking.isLoading ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </>
  );
}
