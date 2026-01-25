import React from 'react';
import Sidebar from '../../layouts/admin/Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-y-auto bg-gray-100 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
