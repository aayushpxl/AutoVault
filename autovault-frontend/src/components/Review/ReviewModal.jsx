import React from "react";
import { FaStar, FaUserCircle } from "react-icons/fa";

export default function ReviewsModal({ isOpen, onClose, reviews = [], averageRating = 0 }) {
  if (!isOpen) return null;

  const formattedAvg = averageRating.toFixed(1);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Title */}
        <h2 className="text-2xl font-bold mb-2 text-indigo-700">User Reviews</h2>

        {/* Average Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.round(averageRating) ? "fill-yellow-500" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">{formattedAvg} / 5</span>
        </div>

        {/* Review List */}
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet for this vehicle.</p>
        ) : (
          reviews.map(({ _id, userId, rating, comment, createdAt }) => (
            <div key={_id} className="mb-4 pb-3 border-b border-gray-200">
              {/* User Profile */}
              <div className="flex items-start gap-3 mb-1">
                <FaUserCircle className="text-3xl text-indigo-500" />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 leading-tight">
                    {userId?.username || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500">{userId?.email || "N/A"}</p>
                </div>
                <div className="flex items-center text-yellow-500 mt-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
              </div>

              {/* Comment */}
              <p className="text-sm text-gray-700 mb-1">{comment || "No comment provided."}</p>

              {/* Date */}
              <p className="text-xs text-gray-400">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}

        {/* Close Button */}
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
