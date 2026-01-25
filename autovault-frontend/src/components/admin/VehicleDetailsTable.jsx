import React, { useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaWeightHanging,
  FaGasPump,
  FaUserFriends,
  FaMoneyBillWave,
  FaCar,
} from "react-icons/fa";

import { useAdminVehicles, useDeleteVehicle } from "../../hooks/admin/useAdminVehicle";
import DeleteModal from "../../components/auth/DeleteModal";
import CreateVehicleModal from "../../components/auth/CreateVehicleModal";
import UpdateVehicleModal from "../../components/auth/UpdateVehicleModal";

import { useVehicleReviews } from "../../hooks/useReview";
import ReviewsModal from "../../components/Review/ReviewModal";

export default function VehicleDetailsTable() {
  const { vehicles, isLoading, isError, error } = useAdminVehicles();
  const deleteMutation = useDeleteVehicle();

  const [deleteId, setDeleteId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useVehicleReviews(selectedVehicleId);

  const handleDelete = () => {
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: (err) =>
        alert("Failed to delete vehicle: " + (err.message || "Unknown error")),
    });
  };

  const getAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return total / reviews.length;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-800 flex items-center justify-center gap-3">
            <FaCar className="text-indigo-600" />
            Vehicle Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            An elegant overview and control center for your transport vehicles.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">All Registered Vehicles</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-4 py-2.5 rounded-lg shadow transition"
          >
            <FaPlus /> Add Vehicle
          </button>
        </div>

        {/* Modals */}
        <CreateVehicleModal showModal={showCreateModal} onClose={() => setShowCreateModal(false)} />
        <UpdateVehicleModal
          showModal={!!updateId}
          vehicleId={updateId}
          onClose={() => setUpdateId(null)}
        />
        <DeleteModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Vehicle"
          description="Are you sure you want to delete this vehicle? This action cannot be undone."
        />
        <ReviewsModal
          isOpen={!!selectedVehicleId}
          onClose={() => setSelectedVehicleId(null)}
          reviews={reviews}
          loading={reviewsLoading}
          error={reviewsError}
          averageRating={getAverageRating(reviews)}
        />

        {/* Content */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading vehicles...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Error: {error.message}</p>
        ) : vehicles.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">
            <p className="text-xl">No vehicles available 🚫</p>
            <p className="text-sm mt-1">Add a vehicle to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white rounded-xl shadow border border-gray-200 transition-transform hover:scale-[1.01] overflow-hidden"
              >
                {/* Image & Actions */}
                <div className="relative">
                  <img
                    src={
                      vehicle.filepath
                        ? `http://localhost:5000/uploads/${vehicle.filepath}`
                        : "/placeholder.jpg"
                    }
                    alt={vehicle.vehicleName}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => setUpdateId(vehicle._id)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full shadow"
                      title="Edit"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(vehicle._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow"
                      title="Delete"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-md text-gray-800 truncate">
                      {vehicle.vehicleName}
                    </h3>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                      {vehicle.vehicleType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaWeightHanging className="text-indigo-500" />
                      {vehicle.loadCapacityKg} kg
                    </div>
                    <div className="flex items-center gap-1">
                      <FaGasPump className="text-indigo-500" />
                      {vehicle.fuelCapacityLitres} L
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUserFriends className="text-indigo-500" />
                      {vehicle.passengerCapacity}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-indigo-500" />
                      NPR {vehicle.pricePerTrip}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedVehicleId(vehicle._id)}
                    className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
