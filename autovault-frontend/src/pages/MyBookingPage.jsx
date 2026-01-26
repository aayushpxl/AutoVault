import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../api/Api";
import CancelBookingModal from "../components/auth/Booking/CancelBookingModal";
import UndoCancelModal from "../components/auth/Booking/UndoCancelModal";
import UpdateBookingModal from "../components/auth/Booking/UpdateBookingModal";
import BookingDeleteModal from "../components/auth/Booking/BookingDeleteModal";
import { FaTimesCircle, FaUndoAlt, FaEdit, FaTrashAlt } from "react-icons/fa";

const BACKEND_URL = "https://localhost:5000";

const fetchUserBookings = async () => {
  const { data } = await axios.get("/bookings/my");
  return data;
};

export default function MyBookingPage() {
  const queryClient = useQueryClient();
  const [cancelModalBookingId, setCancelModalBookingId] = useState(null);
  const [undoModalBookingId, setUndoModalBookingId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteModalBookingId, setDeleteModalBookingId] = useState(null);

  const {
    data: bookings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user_bookings"],
    queryFn: fetchUserBookings,
  });

  const openEditModal = (booking) => setEditingBooking(booking);
  const closeEditModal = () => setEditingBooking(null);

  if (isLoading)
    return (
      <p className="text-center mt-6 text-gray-500 text-lg font-medium">
        Loading your bookings...
      </p>
    );
  if (isError)
    return (
      <p className="text-center mt-6 text-red-600 font-semibold">
        Error: {error.message}
      </p>
    );
  if (!bookings.length)
    return (
      <p className="text-center mt-6 text-gray-600 text-lg">
        You have no bookings yet.
      </p>
    );

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-gray-900 tracking-tight">
          My Bookings
        </h1>

        <div className="flex flex-col gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-300 border border-gray-200 overflow-hidden w-full h-[240px] flex"
            >
              {/* Left Image */}
              <div className="w-[35%] h-full relative">
                <img
                  src={
                    booking.vehicleId?.filepath
                      ? `${BACKEND_URL}/uploads/${booking.vehicleId.filepath}`
                      : "/placeholder.jpg"
                  }
                  alt={booking.vehicleId?.vehicleName || "Vehicle"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 text-[10px] bg-white bg-opacity-80 px-2 py-1 rounded-full font-semibold">
                  1/1
                </div>
              </div>

              {/* Right Content */}
              <div className="w-[65%] p-5 flex flex-col justify-between">
                {/* Top Row: Title and Status */}
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[16px] font-bold text-gray-800 leading-tight line-clamp-1">
                    {booking.vehicleId?.vehicleName || "Unnamed Vehicle"}
                  </h3>
                  <span
                    className={`text-[12px] font-medium px-2 py-[2px] rounded-full ${booking.status === "cancelled"
                        ? "bg-red-100 text-red-500"
                        : "bg-green-100 text-green-600"
                      }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Dates */}
                <p className="text-[13px] text-gray-600 mb-1">
                  📅 {new Date(booking.startDate).toLocaleDateString()} →{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>

                {/* Locations */}
                <div className="text-[13px] text-gray-700 space-y-1 mb-3">
                  <p>
                    📍 <strong>Pickup:</strong> {booking.pickupLocation || "N/A"}
                  </p>
                  <p>
                    🎯 <strong>Drop:</strong> {booking.dropLocation || "N/A"}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <p className="text-blue-700 font-bold text-[15px]">
                    Price: NPR {booking.totalPrice}
                  </p>
                  <div className="flex gap-3 min-w-[240px] justify-end">
                    {booking.status === "cancelled" ? (
                      <button
                        onClick={() => setUndoModalBookingId(booking._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[12px] px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <FaUndoAlt size={12} />
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => setCancelModalBookingId(booking._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-[12px] px-3 py-1 rounded-md flex items-center gap-1"
                      >
                        <FaTimesCircle size={12} />
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(booking)}
                      disabled={booking.status === "cancelled"}
                      className={`text-[12px] px-3 py-1 rounded-md flex items-center gap-1 ${booking.status === "cancelled"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        }`}
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => setDeleteModalBookingId(booking._id)}
                      className="bg-gray-200 hover:bg-gray-300 text-red-600 text-[12px] px-3 py-1 rounded-md flex items-center gap-1 whitespace-nowrap"
                    >
                      <FaTrashAlt size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {cancelModalBookingId && (
        <CancelBookingModal
          bookingId={cancelModalBookingId}
          onClose={() => setCancelModalBookingId(null)}
        />
      )}
      {undoModalBookingId && (
        <UndoCancelModal
          bookingId={undoModalBookingId}
          onClose={() => setUndoModalBookingId(null)}
        />
      )}
      <UpdateBookingModal
        bookingId={editingBooking?._id}
        showModal={!!editingBooking}
        onClose={closeEditModal}
        onSuccess={() => queryClient.invalidateQueries(["user_bookings"])}
      />
      {deleteModalBookingId && (
        <BookingDeleteModal
          bookingId={deleteModalBookingId}
          onClose={() => setDeleteModalBookingId(null)}
        />
      )}
    </div>
  );
}
