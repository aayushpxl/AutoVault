// src/components/dashboard/CurrentBookings.jsx
import React from "react";
import { FaCalendarCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CurrentBookings = () => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/admin/bookings"); // Adjust if route differs
  };

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50 px-3 py-2 rounded-md shadow-sm flex items-center gap-3 h-16 w-full hover:shadow-md transition-all duration-200 group">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shadow ring-2 ring-indigo-200 group-hover:scale-105 transition-transform duration-200"
        style={{ backgroundColor: "#DCFCE7" }}
      >
        <FaCalendarCheck className="text-sm" style={{ color: "#16A34A" }} />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">
          Current Bookings
        </div>
      </div>

      {/* Hover Button */}
      <button
        onClick={handleViewAll}
        className="absolute top-1 right-2 text-[10px] px-2 py-[2px] rounded bg-indigo-600 text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs"
      >
        View All
      </button>
    </div>
  );
};

export default CurrentBookings;
