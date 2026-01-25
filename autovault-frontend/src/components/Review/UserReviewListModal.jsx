import React from "react";
import { FaStar } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";

export default function ReviewListModal({
  isOpen,
  onClose,
  reviews = [],
  onAddReview,
}) {
  if (!isOpen) return null;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "N/A";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-1">User Reviews</h2>

        {/* ⭐ Average rating stars + value */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar key={i} className={i <= Math.round(avgRating) ? "" : "opacity-20"} />
            ))}
          </div>
          <span className="text-sm text-gray-500">Average Rating: {avgRating} / 5</span>
        </div>

        {/* 🧾 Review list */}
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet for this vehicle.</p>
        ) : (
          reviews.map(({ _id, userId, rating, comment, createdAt }) => (
            <div key={_id} className="mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <FaUserCircle className="text-gray-500 text-lg" />
                  <span>
                    {userId?.username || "Unknown"}{" "}
                    <span className="text-xs text-gray-400">
                      ({userId?.email || "N/A"})
                    </span>
                  </span>
                </div>
                <div className="flex text-yellow-500">
                  {[...Array(rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {comment || "No comment"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}

        {/* 🔘 Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onAddReview}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add Review
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
