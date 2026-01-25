import React, { useState, useEffect } from "react";
import {
  FaWeightHanging,
  FaGasPump,
  FaUserFriends,
  FaStar,
  FaRegStar,
} from "react-icons/fa";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useAdminVehicles } from "../../src/hooks/admin/useAdminVehicle";
import BookingModal from "../../src/components/auth/Booking/BookingModal";
import {
  useAddSavedVehicle,
  useRemoveSavedVehicle,
  useSavedVehicles,
} from "../../src/hooks/useSaveVehicle";
import { useAddReview } from "../../src/hooks/useReview";
import ReviewListModal from "../../src/components/Review/UserReviewListModal";
import AOS from "aos";
import "aos/dist/aos.css";

function ReviewModal({ show, onClose, vehicle, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { mutate: addReview, isLoading } = useAddReview();

  if (!show) return null;

  const handleStarClick = (starValue) => setRating(starValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Please select a star rating");

    addReview(
      { vehicleId: vehicle._id, rating, comment },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          onClose();
          if (onReviewAdded) onReviewAdded();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold mb-4">Add Your Review</h2>
        <div className="flex gap-1 mb-4 justify-center">
          {[1, 2, 3, 4, 5].map((star) =>
            star <= rating ? (
              <FaStar
                key={star}
                onClick={() => handleStarClick(star)}
                className="text-yellow-400 cursor-pointer"
                size={30}
              />
            ) : (
              <FaRegStar
                key={star}
                onClick={() => handleStarClick(star)}
                className="text-yellow-400 cursor-pointer"
                size={30}
              />
            )
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            rows={4}
            placeholder="Write your review (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded p-2"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserVehicleTable() {
  const navigate = useNavigate();
  const { vehicles, isLoading, isError, error } = useAdminVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedType, setSelectedType] = useState("All");
  const { savedVehicles = [] } = useSavedVehicles();
  const { mutate: addToSaved } = useAddSavedVehicle();
  const { mutate: removeFromSaved } = useRemoveSavedVehicle();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewVehicle, setReviewVehicle] = useState(null);
  const [showReviewListModal, setShowReviewListModal] = useState(false);
  const [reviewListVehicle, setReviewListVehicle] = useState(null);
  const [reviewsMap, setReviewsMap] = useState({});
  const vehicleTypes = ["All", ...new Set(vehicles.map((v) => v.vehicleType).filter(Boolean))]; // ← Line ~99


  const isVehicleSaved = (id) =>
    savedVehicles.some((v) => v?.vehicleId?._id === id);

  const toggleSaveVehicle = (vehicleId) => {
    if (isVehicleSaved(vehicleId)) {
      removeFromSaved(vehicleId);
    } else {
      addToSaved(vehicleId);
    }
  };

  const getAverageRating = (reviews) => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  useEffect(() => {
    if (!vehicles) return;
    vehicles.forEach(async (vehicle) => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/reviews/${vehicle._id}`
        );
        const data = await res.json();
        setReviewsMap((prev) => ({ ...prev, [vehicle._id]: data }));
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      }
    });
  }, [vehicles]);

  const onReviewAdded = () => {
    if (!reviewVehicle) return;
    fetch(`http://localhost:5000/api/reviews/${reviewVehicle._id}`)
      .then((res) => res.json())
      .then((data) =>
        setReviewsMap((prev) => ({ ...prev, [reviewVehicle._id]: data }))
      );
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: false });
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide block mb-1">
              Available Vehicles
            </span>
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Vehicle Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full max-w-xs border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary"
            >
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>





        <BookingModal
          showModal={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          vehicle={selectedVehicle}
        />

        <ReviewModal
          show={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          vehicle={reviewVehicle}
          onReviewAdded={onReviewAdded}
        />

        <ReviewListModal
          isOpen={showReviewListModal}
          onClose={() => setShowReviewListModal(false)}
          reviews={
            reviewListVehicle ? reviewsMap[reviewListVehicle._id] || [] : []
          }
          onAddReview={() => {
            setReviewVehicle(reviewListVehicle);
            setShowReviewModal(true);
            setShowReviewListModal(false);
          }}
        />

        {isLoading ? (
          <p className="text-center text-gray-500">Loading vehicles...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Error: {error.message}</p>
        ) : vehicles.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">
            <p className="text-xl">No vehicles available 🚫</p>
            <p className="text-sm mt-1">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles
              .filter((v) => selectedType === "All" || v.vehicleType === selectedType)
              .map((vehicle) => {
                const isSaved = isVehicleSaved(vehicle._id);
                const reviews = reviewsMap[vehicle._id] || [];
                const avgRating = getAverageRating(reviews);

                return (
                  <div
                    key={vehicle._id}
                    data-aos="fade-up"
                    className="relative rounded-xl border border-black-200 bg-white overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleSaveVehicle(vehicle._id)}
                      className="absolute top-3 right-3 z-10 p-1 bg-transparent focus:outline-none"
                      title={isSaved ? "Unsave" : "Save"}
                    >
                      {isSaved ? (
                        <FaHeart className="text-black text-xl" />
                      ) : (
                        <FaRegHeart className="text-gray-400 hover:text-secondary text-xl transition" />
                      )}
                    </button>

                    {/* Clickable image + name */}
                    <div
                      onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                      className="cursor-pointer"
                    >
                      <div className="h-40 flex items-center justify-center border-b">
                        <img
                          src={
                            vehicle.filepath
                              ? `http://localhost:5000/uploads/${vehicle.filepath}`
                              : "/placeholder.jpg"
                          }
                          alt={vehicle.vehicleName}
                          className="max-h-full max-w-[90%] object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 text-base">
                            {vehicle.vehicleName}
                          </h3>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) =>
                                star <= Math.round(avgRating) ? (
                                  <FaStar key={star} className="text-yellow-400" />
                                ) : (
                                  <FaRegStar key={star} className="text-yellow-400" />
                                )
                              )}
                            </div>
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewListVehicle(vehicle);
                                setShowReviewListModal(true);
                              }}
                              className="text-sm text-gray-500 mt-1 cursor-pointer"
                            >
                              View Reviews
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {vehicle.vehicleType || "Unknown Type"}
                        </p>
                        <div className="flex gap-4 mt-4 text-sm text-[#64748b]">
                          <div className="flex items-center gap-1">
                            <FaGasPump style={{ color: "#90A3BF" }} />
                            {vehicle.fuelCapacityLitres}L
                          </div>
                          <div className="flex items-center gap-1">
                            <FaWeightHanging style={{ color: "#90A3BF" }} />
                            {vehicle.loadCapacityKg}kg
                          </div>
                          <div className="flex items-center gap-1">
                            <FaUserFriends style={{ color: "#90A3BF" }} />
                            {vehicle.passengerCapacity} People
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-auto border-t pt-3 px-4 pb-4">
                      <div className="text-secondary font-semibold text-base">
                        Rs{vehicle.pricePerTrip.toFixed(2)}
                        <span className="text-gray-500 text-xs"> /day</span>
                      </div>
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="bg-secondary hover:bg-teal-700 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition"
                      >
                        Rent Now
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
