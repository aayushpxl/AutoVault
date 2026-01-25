import React, { useState } from "react";
import {
  FaWeightHanging,
  FaGasPump,
  FaUserFriends,
  FaTrash,
  FaCalendarCheck,
} from "react-icons/fa";
import { useSavedVehicles, useRemoveSavedVehicle } from "../hooks/useSaveVehicle";
import BookingModal from "../components/auth/Booking/BookingModal"; // Adjust if path differs

export default function SavedVehicle() {
  const { savedVehicles = [], isLoading, isError, error } = useSavedVehicles();
  const { mutate: removeVehicle } = useRemoveSavedVehicle();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleToRemove, setVehicleToRemove] = useState(null);
  console.log("Saved Vehicles Data:", savedVehicles);

  const confirmRemove = () => {
    if (vehicleToRemove) {
      removeVehicle(vehicleToRemove);
      setVehicleToRemove(null);
    }
  };

  const cancelRemove = () => {
    setVehicleToRemove(null);
  };

  const shouldCenterContent = isLoading || isError || savedVehicles.length === 0;

  return (
    <div
      className={`min-h-screen py-8 px-4 max-w-7xl mx-auto ${
        shouldCenterContent
          ? "flex flex-col justify-center items-center text-center"
          : ""
      }`}
    >
      {/* Top-left title */}
      <div className="flex justify-start mb-4 w-full">
        <h2 className="text-2xl font-bold flex items-center gap-2">
         
          
        </h2>
      </div>

      {/* Booking Modal */}
      <BookingModal
        showModal={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
      />

      {/* Main Content */}
      {isLoading ? (
        <p className="text-gray-500">Loading saved vehicles...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : savedVehicles.length === 0 ? (
        <p className="text-gray-500 text-xl">You have no saved vehicles yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {/*
            IMPORTANT FIX:
            Filter out any saved vehicles where vehicleId is null or undefined
          */}
          {savedVehicles
            .filter((item) => item.vehicleId) // Skip invalid vehicle references
            .map(({ vehicleId }) => (
              <div
                key={vehicleId._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden flex flex-col max-w-xs mx-auto"
              >
                <div className="h-52 flex items-center justify-center bg-white border-b">
                  <img
                    src={
                      vehicleId.filepath
                        ? `http://localhost:5000/uploads/${vehicleId.filepath}`
                        : "/placeholder.jpg"
                    }
                    alt={vehicleId.vehicleName}
                    className="max-h-full max-w-[90%] object-contain"
                  />
                </div>

                <div className="p-4 flex-grow">
                  <h3 className="font-semibold text-gray-800 text-base">
                    {vehicleId.vehicleName}
                  </h3>
                  <p className="text-xs text-gray-500">2024</p>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaWeightHanging className="text-blue-500" />
                      {vehicleId.loadCapacityKg} kg
                    </div>
                    <div className="flex items-center gap-1">
                      <FaGasPump className="text-green-500" />
                      {vehicleId.fuelCapacityLitres} L
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUserFriends className="text-indigo-500" />
                      {vehicleId.passengerCapacity}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 border-t pt-3">
                    <div className="text-primary font-bold text-base text-green-600">
                      NPR {vehicleId.pricePerTrip}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedVehicle(vehicleId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1"
                        title="Book Vehicle"
                      >
                        <FaCalendarCheck /> Book
                      </button>

                      <button
                        onClick={() => setVehicleToRemove(vehicleId._id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg flex items-center gap-1"
                        title="Remove from Favorites"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {vehicleToRemove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Removal</h3>
            <p className="mb-6">
              Do you want to remove this vehicle from your favorites?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelRemove}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
