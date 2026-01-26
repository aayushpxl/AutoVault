import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartLine, FaUser, FaCar, FaBook, FaMoneyBillWave, FaInbox, FaCog, FaClipboardList
} from 'react-icons/fa';

const SidebarItem = ({ icon, label, to }) => (
  <NavLink to={to}>
    {({ isActive }) => (
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-tr-md rounded-br-md transition duration-200 text-sm font-medium ${isActive
          ? 'text-blue-600 border-l-4 border-blue-600'
          : 'text-gray-400 hover:text-blue-500'
          }`}
      >
        <span className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
    )}
  </NavLink>
);





const Sidebar = () => (
  <aside className="w-64 h-full bg-gradient-to-b from-white to-gray-100 p-5 flex flex-col gap-8 border-r">
    <div>
      <h2 className="text-gray-400 text-xs font-semibold mb-2 px-2">MAIN</h2>
      <div className="flex flex-col gap-1">
        <SidebarItem icon={<FaChartLine />} label="Dashboard" to="/admin/dashboard" />
        <SidebarItem icon={<FaUser />} label="Users" to="/admin/users" />
        <SidebarItem icon={<FaCar />} label="Vehicles" to="/admin/vehicles" />
        <SidebarItem icon={<FaBook />} label="Bookings" to="/admin/bookings" />
        <SidebarItem icon={<FaClipboardList />} label="Audit Logs" to="/admin/logs" />
      </div>
    </div>

    <div>
      <h2 className="text-gray-400 text-xs font-semibold mb-2 px-2">OTHER</h2>
      <div className="flex flex-col gap-1">
        <SidebarItem icon={<FaMoneyBillWave />} label="Payments" to="/admin/payments" />
        <SidebarItem icon={<FaInbox />} label="Messages" to="/admin/messages" />
        <SidebarItem icon={<FaChartLine />} label="Reports" to="/admin/reports" />
      </div>
    </div>

    <div className="mt-auto">
      <h2 className="text-gray-400 text-xs font-semibold mb-2 px-2">SETTINGS</h2>
      <SidebarItem icon={<FaCog />} label="Settings" to="/admin/setting" />
    </div>
  </aside>
);

export default Sidebar;
