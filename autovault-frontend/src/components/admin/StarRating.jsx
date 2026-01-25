import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function StarRating({ rating, size = 16 }) {
  // rating: number from 0 to 5
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={"full_" + i} size={size} />
      ))}
      {halfStar && <FaStarHalfAlt size={size} />}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={"empty_" + i} size={size} />
      ))}
    </div>
  );
}
