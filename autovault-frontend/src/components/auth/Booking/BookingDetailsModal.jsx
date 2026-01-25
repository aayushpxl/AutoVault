import React from "react";
import {
  FaUser,
  FaCar,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaDollarSign,
} from "react-icons/fa";

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const statusColors = {
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-green-100 text-green-700",
    pending: "bg-blue-100 text-blue-700",
  };

  const statusClass = statusColors[booking.status] || statusColors.pending;

  const getAvatarLetter = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 overflow-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-3xl relative mx-4 my-10 animate-fadeIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
        >
          &times;
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-center gap-3">
          <FaCar className="text-indigo-500 text-xl" />
          <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vehicle Image */}
          {booking.vehicleId?.filepath && (
            <div className="w-full flex justify-center">
              <img
                src={`http://localhost:5000/uploads/${booking.vehicleId.filepath}`}
                alt={booking.vehicleId.vehicleName || "Vehicle"}
                className="rounded-lg shadow-sm max-h-[220px] object-contain"
              />
            </div>
          )}

          {/* User Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaUser className="text-indigo-500" /> User Info
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-lg font-bold">
                {getAvatarLetter(booking.userId?.username)}
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  {booking.userId?.username || "N/A"}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <FaEnvelope className="text-indigo-400" />
                  {booking.userId?.email || "N/A"}
                </p>
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <FaPhone className="text-indigo-400" />
                  {booking.userId?.phone || "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Vehicle Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCar className="text-indigo-500" /> Vehicle Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p><strong>Name:</strong> {booking.vehicleId?.vehicleName || "N/A"}</p>
              <p><strong>Type:</strong> {booking.vehicleId?.vehicleType || "N/A"}</p>
              <p>
                <strong>Price/Trip:</strong>{" "}
                {booking.vehicleId
                  ? `Rs. ${booking.vehicleId.pricePerTrip}`
                  : "N/A"}
              </p>
            </div>
          </section>

          {/* Booking Info */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-500" /> Booking Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                >
                  {booking.status || "N/A"}
                </span>
              </p>
              <p className="flex items-center gap-1">
                <FaCalendarAlt className="text-indigo-400" />
                <strong>Start:</strong> {formatDate(booking.startDate)}
              </p>
              <p className="flex items-center gap-1">
                <FaCalendarAlt className="text-indigo-400" />
                <strong>End:</strong> {formatDate(booking.endDate)}
              </p>
              <p className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-indigo-400" />
                <strong>Pickup:</strong> {booking.pickupLocation || "N/A"}
              </p>
              <p className="flex items-center gap-1">
                <FaMapMarkerAlt className="text-indigo-400" />
                <strong>Drop:</strong> {booking.dropLocation || "N/A"}
              </p>
              <p className="mt-2 text-lg font-bold text-indigo-600 flex items-center gap-1">
                <FaDollarSign /> Rs. {booking.totalPrice || "N/A"}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(20px);}
          to {opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default BookingDetailsModal;
