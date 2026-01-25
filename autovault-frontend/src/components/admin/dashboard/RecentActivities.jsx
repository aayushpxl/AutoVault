import React from "react";
import { useAdminVehicles } from "../../../hooks/admin/useAdminVehicle";
import { useAdminUser } from "../../../hooks/admin/useAdminUser";

const RecentActivity = () => {
  const { vehicles } = useAdminVehicles();
  const { data: usersData } = useAdminUser(1, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Latest Users */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 select-none">Latest Users</h3>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2 select-none">
                  Username
                </th>
              </tr>
            </thead>
            <tbody>
              {usersData?.data?.slice(0, 5).map((user) => (
                <tr
                  key={user._id}
                  className="border-b last:border-b-0 hover:bg-indigo-50 transition-colors cursor-default select-text"
                >
                  <td className="px-4 py-3 text-gray-700 font-medium">{user.username}</td>
                </tr>
              ))}
              {!usersData?.data?.length && (
                <tr>
                  <td className="px-4 py-3 text-sm italic text-gray-400 select-none">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Vehicles */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 select-none">Latest Vehicles</h3>

        {/* Vehicles Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2 select-none">
                  Vehicle Name
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2 select-none">
                  Rate per Trip
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicles?.slice(0, 5).map((v) => (
                <tr
                  key={v._id}
                  className="border-b last:border-b-0 hover:bg-indigo-50 transition-colors cursor-default select-text"
                >
                  <td className="px-4 py-3 text-gray-700 font-medium">{v.vehicleName}</td>
                  <td className="px-4 py-3 text-indigo-700 font-semibold">Rs. {v.pricePerTrip}</td>
                </tr>
              ))}
              {!vehicles?.length && (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm italic text-gray-400 select-none">
                    No vehicles found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
