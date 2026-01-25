import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa";
import { MdLocalGasStation, MdOutlinePeople, MdWorkOutline } from "react-icons/md";
import ReviewListModal from "../../components/Review/UserReviewListModal";
import ReviewModal from "../../components/Review/ReviewModal";
import { useAddReview } from "../../hooks/useReview";
import { useVehicleDetails } from "../../hooks/useVehicleDetailsPage";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const { vehicle, relatedVehicles, loading, error } = useVehicleDetails(id);

  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReviewListModal, setShowReviewListModal] = useState(false);
  const { mutate: addReview } = useAddReview();

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const getAverageRating = () => {
    if (!reviews.length) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  };

  const avgRating = getAverageRating();

  if (loading) return <div className="text-center mt-10">Loading vehicle details...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">Error: {error}</div>;
  if (!vehicle) return <div className="text-center mt-10">Vehicle not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-12">
      {/* Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Vehicle Image & Info */}
        <div className="md:col-span-2 space-y-6">
          <img
            src={`http://localhost:5000/uploads/${vehicle.filepath}`}
            alt={vehicle.vehicleName}
            className="w-full max-h-72 object-contain rounded-lg border shadow-sm"
          />
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{vehicle.vehicleName}</h1>
            <p className="text-gray-600 mt-3 leading-relaxed">{vehicle.vehicleDescription || "No description available."}</p>

            <div className="flex flex-wrap gap-8 mt-6 text-gray-700 text-base font-medium">
              <div className="flex items-center gap-2">
                <MdLocalGasStation className="text-teal-600" size={24} />
                <span>{vehicle.fuelCapacityLitres} Litres Fuel Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <MdWorkOutline className="text-teal-600" size={24} />
                <span>{vehicle.loadCapacityKg} Kg Load Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <MdOutlinePeople className="text-teal-600" size={24} />
                <span>{vehicle.passengerCapacity} Passengers</span>
              </div>
              <div>
                <strong>Type:</strong> {vehicle.vehicleType || "N/A"}
              </div>
            </div>

            <div className="mt-6 text-3xl font-bold text-teal-700">
              Rs{vehicle.pricePerTrip.toFixed(2)} <span className="text-lg text-gray-500 font-normal">/ day</span>
            </div>
            <button className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300">
              Rent Now
            </button>
          </div>

          {/* Vehicle Specs */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-5">Vehicle Specs</h3>
            <ul className="text-gray-700 space-y-3 list-disc list-inside text-lg">
              <li>Fuel Capacity: {vehicle.fuelCapacityLitres} Litres</li>
              <li>Load Capacity: {vehicle.loadCapacityKg} Kg</li>
              <li>Passenger Capacity: {vehicle.passengerCapacity}</li>
            </ul>
          </div>
        </div>

        {/* Reviews Section */}
<div className="border rounded-lg p-6 flex flex-col shadow-md bg-white max-h-[380px]">
  <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b pb-3">Reviews</h2>

  <div className="flex items-center gap-1 mb-4">
    {[1, 2, 3, 4, 5].map((star) =>
      star <= Math.round(avgRating) ? (
        <FaStar key={star} className="text-yellow-500" size={22} />
      ) : (
        <FaRegStar key={star} className="text-yellow-400" size={22} />
      )
    )}
    <span className="text-gray-500 ml-3 text-sm font-medium">
      {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
    </span>
  </div>

  <div className="mb-6 flex-grow overflow-y-auto max-h-32 pr-2">
    {reviews.length > 0 ? (
      <blockquote className="italic text-gray-700 text-lg leading-relaxed border-l-4 border-teal-600 pl-4">
        "{reviews[0].comment || "Great vehicle!"}"
      </blockquote>
    ) : (
      <p className="text-gray-500 text-lg">No reviews yet. Be the first to add one!</p>
    )}
  </div>

  <div className="flex gap-4 mt-auto">
    <button
      onClick={() => setShowReviewListModal(true)}
      className="flex-1 bg-gray-200 hover:bg-gray-300 transition px-4 py-2 rounded-md font-medium"
    >
      View All Reviews
    </button>
    <button
      onClick={() => setShowReviewModal(true)}
      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium transition"
    >
      Add Review
    </button>
  </div>
</div>

      </div>

      {/* Related Vehicles Section */}
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">Related Vehicles</h2>
        {relatedVehicles.length === 0 ? (
          <p className="text-gray-500 text-lg">No related vehicles found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {relatedVehicles.map((v) => (
              <Link
                to={`/vehicles/${v._id}`}
                key={v._id}
                className="border rounded-lg p-4 hover:shadow-lg transition shadow-sm bg-white"
              >
                <img
                  src={
                    v.filepath
                      ? `http://localhost:5000/uploads/${v.filepath}`
                      : "/placeholder.jpg"
                  }
                  alt={v.vehicleName}
                  className="h-40 w-full object-contain mb-3 rounded"
                />
                <h3 className="font-semibold text-lg text-gray-900">{v.vehicleName}</h3>
                <p className="text-sm text-gray-600">{v.vehicleType || "Unknown Type"}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Review Modals */}
      <ReviewListModal
        isOpen={showReviewListModal}
        onClose={() => setShowReviewListModal(false)}
        reviews={reviews}
        onAddReview={() => {
          setShowReviewModal(true);
          setShowReviewListModal(false);
        }}
      />

      <ReviewModal
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        vehicle={vehicle}
        onReviewAdded={fetchReviews}
      />
    </div>
  );
};

export default VehicleDetailsPage;
