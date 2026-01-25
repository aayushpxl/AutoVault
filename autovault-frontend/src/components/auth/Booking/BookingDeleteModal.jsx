import React from "react";
import { FaTrashAlt } from "react-icons/fa"; 
import { useDeleteBooking } from "../../../hooks/useBooking";

export default function BookingDeleteModal({ bookingId, onClose }) {
  const { mutate: deleteBooking, isLoading } = useDeleteBooking();

  const handleDelete = () => {
    deleteBooking(bookingId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-800">Delete Booking</h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to permanently delete this booking? This action
          cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 flex items-center gap-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
          >
            <FaTrashAlt size={18} />
            {isLoading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
