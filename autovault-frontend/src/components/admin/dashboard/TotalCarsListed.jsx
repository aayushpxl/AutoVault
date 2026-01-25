import React from "react";
import { FaCar } from "react-icons/fa";
import { useAdminVehicles } from "../../../hooks/admin/useAdminVehicle";
import { useNavigate } from "react-router-dom";

const TotalCarsListed = () => {
  const { vehicles = [], isLoading, isError } = useAdminVehicles();
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/admin/vehicles");
  };

  if (isLoading)
    return (
      <div className="bg-gradient-to-br from-white to-gray-100 px-3 py-2 rounded-md shadow-sm flex items-center gap-2 animate-pulse h-16 w-full" />
    );

  if (isError)
    return (
      <div className="bg-red-50 px-3 py-2 rounded-md shadow-sm flex items-center gap-2 text-red-600 text-xs font-medium h-16">
        Failed to load cars
      </div>
    );

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50 px-3 py-2 rounded-md shadow-sm flex items-center gap-3 h-16 w-full hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white text-sm shadow ring-2 ring-indigo-200 group-hover:scale-105 transition-transform duration-200">
        <FaCar />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">
          Total Cars Listed
        </div>
        <div className="text-base font-bold text-indigo-800">{vehicles.length}</div>
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

export default TotalCarsListed;
