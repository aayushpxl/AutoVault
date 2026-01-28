import React from "react";
import RegisterForm from "../components/auth/RegisterForm";
import { FaCar, FaShieldAlt, FaUserCheck } from "react-icons/fa";

const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC]">
      {/* Left Side - Brand & Value Prop */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <FaCar className="text-blue-600" /> AutoVault
          </h2>
        </div>

        <h1 className="text-5xl font-extrabold text-[#0f172a] leading-tight mb-4">
          Join the trusted <br /> vehicle network
        </h1>

        <p className="text-lg text-slate-500 mb-12 max-w-lg">
          Create your account to start listing vehicles, booking rentals, and connecting with our community.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaShieldAlt className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Verified identity</h3>
              <p className="text-sm text-slate-500">Build trust with a verified profile</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaCar className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Manage your garage</h3>
              <p className="text-sm text-slate-500">Track all your vehicles in one place</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaUserCheck className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Exclusive deals</h3>
              <p className="text-sm text-slate-500">Get access to premium listings and offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-6">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
