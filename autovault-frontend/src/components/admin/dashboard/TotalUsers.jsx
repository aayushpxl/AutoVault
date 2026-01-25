import React from "react";
import { FaUser } from "react-icons/fa";
import { useAdminUser } from "../../../hooks/admin/useAdminUser";
import { useNavigate } from "react-router-dom";

const TotalUsers = () => {
  const { data, isLoading, isError, error } = useAdminUser(1, 1000);
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate("/admin/users");
  };

  if (isLoading)
    return (
      <div className="relative bg-gradient-to-br from-white to-gray-100 px-3 py-2 rounded-md shadow-sm flex items-center gap-2 animate-pulse h-16 w-full" />
    );

  if (isError) {
    console.error("Error loading users:", error);
    return (
      <div className="bg-red-50 px-3 py-2 rounded-md shadow-sm flex items-center gap-2 text-red-600 text-xs font-medium h-16">
        Failed to load users
      </div>
    );
  }

  const totalUsers = data?.data?.length ?? 0;

  return (
    <div className="relative bg-gradient-to-br from-white to-indigo-50 px-3 py-2 rounded-md shadow-sm flex items-center gap-3 h-16 w-full hover:shadow-md transition-all duration-200 group">
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shadow ring-2 ring-indigo-200 group-hover:scale-105 transition-transform duration-200"
        style={{ backgroundColor: "#DBEAFE" }}
      >
        <FaUser style={{ color: "#2563EB" }} />
      </div>
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">
          Total Users
        </div>
        <div className="text-base font-bold text-indigo-800">{totalUsers}</div>
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

export default TotalUsers;
