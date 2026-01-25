import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/Api";

export default function UndoCancelModal({ bookingId, onClose }) {
  const queryClient = useQueryClient();

  const undoCancelMutation = useMutation({
    mutationFn: () => axios.patch(`/bookings/${bookingId}`, { status: "confirmed" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["user_bookings"]);
      onClose();
    },
    onError: (err) => alert("Failed to undo cancel: " + err.message),
  });

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 z-50 w-96 max-w-full bg-white rounded-xl p-6 shadow-lg -translate-x-1/2 -translate-y-1/2">
        <h2 className="text-xl font-semibold mb-4">Undo Cancel Booking?</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to undo the cancellation of this booking?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Close
          </button>
          <button
            onClick={() => undoCancelMutation.mutate()}
            disabled={undoCancelMutation.isLoading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {undoCancelMutation.isLoading ? "Undoing..." : "Confirm Undo"}
          </button>
        </div>
      </div>
    </>
  );
}
