import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/LoginPage";
import Register from "../pages/RegisterPage";
import Dashboard from "../pages/admin/Dashboard";
import HomePage from "../pages/HomePage";
import MyBookingPage from "../pages/MyBookingPage";
import UserTable from "../components/admin/UserTable";
import VehicleDetailsTable from "../components/admin/VehicleDetailsTable";
import CreateVehicleForm from "../pages/admin/CreateVehicleForm";
import MainLayout from "../layouts/admin/MainLayout";
import UserLayout from "../layouts/UserLayout";
import BookingTable from "../components/BookingTable";
import VehicleDetailPage from "../components/VehicleDetailsPage/VehicleDetailsPage";
import SearchResultsPage from "../components/Search/SearchResultsPage";
import UserProfilePage from "../pages/UserProfilePage";
import AboutUs from "../pages/AboutUs";
import ResetPasswordPage from "../components/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import AdminProfilePage from "../components/admin/AdminProfilePage";
import AuditLogPage from "../pages/admin/AuditLogPage";
import AdminRoute from "./AdminRoute";
import UserRoute from "./UserRoute";
import SavedVehicle from "../pages/SavedVehicle";
import PaymentSuccess from "../pages/PaymentSuccess";
import PaymentFailure from "../pages/PaymentFailure";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserTable />} />
          <Route path="vehicles" element={<VehicleDetailsTable />} />
          <Route path="vehicles/create" element={<CreateVehicleForm />} />
          <Route path="bookings" element={<BookingTable />} />
          <Route path="logs" element={<AuditLogPage />} />
          <Route path="setting" element={<AdminProfilePage />} />
        </Route>
      </Route>

      <Route element={<UserRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/mybooking" element={<MyBookingPage />} />
          <Route path="/savedvehicle" element={<SavedVehicle />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
        </Route>
      </Route>


      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
