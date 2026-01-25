import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

import { useAdminUser } from "../../../hooks/admin/useAdminUser";
import { useAdminVehicles } from "../../../hooks/admin/useAdminVehicle";

const UserVehicleStatsChart = () => {
  const { data: userData, isLoading: userLoading, isError: userError } = useAdminUser(1, 1000);
  const { vehicles = [], isLoading: vehicleLoading, isError: vehicleError } = useAdminVehicles();

  const isLoading = userLoading || vehicleLoading;
  const isError = userError || vehicleError;

  const totalUsers = userData?.data?.length || 0;

  const chartData = [
    { name: "Users", count: totalUsers },
    { name: "Vehicles", count: vehicles.length || 0 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700 text-center select-none">
        Users vs Vehicles
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-gray-400 italic select-none">
          Loading chart...
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center py-20 text-red-500 font-semibold select-none">
          Failed to load chart data.
        </div>
      ) : (
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap={60} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#E0E7FF" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 14, fill: "#4F46E5", fontWeight: "600" }}
                axisLine={{ stroke: "#A5B4FC" }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 14, fill: "#4B5563" }}
                axisLine={{ stroke: "#A5B4FC" }}
                tickLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#EEF2FF",
                  borderColor: "#C7D2FE",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                  fontWeight: "600",
                  color: "#4F46E5",
                  fontSize: 14,
                }}
                labelStyle={{ fontWeight: "700", color: "#3730A3" }}
              />
              <Bar
                dataKey="count"
                fill="url(#colorUv)"
                radius={[10, 10, 0, 0]}
                barSize={48}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#4338CA"
                  fontSize={16}
                  fontWeight="700"
                />
              </Bar>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#A5B4FC" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default UserVehicleStatsChart;
