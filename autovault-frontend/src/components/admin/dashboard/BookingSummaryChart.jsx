import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAdminBookings } from "../../../hooks/useBooking";
import { CheckCircle, XCircle, List } from "lucide-react";

const BookingSummaryChart = () => {
  const { bookings, isLoading, isError, error } = useAdminBookings();

  if (isLoading) return <p className="text-sm text-gray-500">Loading booking summary...</p>;
  if (isError) return <p className="text-sm text-red-500">Error: {error.message}</p>;

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;
  const totalCount = bookings.length;

  const chartData = [
    { name: "Confirmed", value: confirmedCount },
    { name: "Cancelled", value: cancelledCount },
    { name: "Total", value: totalCount },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          Booking Summary
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <SummaryStat
          icon={<CheckCircle className="text-blue-500 w-4 h-4" />}
          label="Confirmed"
          value={confirmedCount}
          bg="bg-blue-50 dark:bg-blue-900"
        />
        <SummaryStat
          icon={<XCircle className="text-red-500 w-4 h-4" />}
          label="Cancelled"
          value={cancelledCount}
          bg="bg-red-50 dark:bg-red-900"
        />
        <SummaryStat
          icon={<List className="text-gray-500 dark:text-gray-300 w-4 h-4" />}
          label="Total"
          value={totalCount}
          bg="bg-gray-50 dark:bg-gray-700"
        />
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            barSize={24}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              wrapperClassName="!text-sm"
              contentStyle={{ backgroundColor: "#f9fafb", borderRadius: "8px", border: "none" }}
              labelStyle={{ fontSize: "12px" }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const SummaryStat = ({ icon, label, value, bg }) => (
  <div className={`flex items-center gap-2 p-2 rounded-lg ${bg}`}>
    {icon}
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-300">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

export default BookingSummaryChart;
