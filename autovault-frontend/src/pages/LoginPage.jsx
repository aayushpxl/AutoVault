import React from "react";
import LoginForm from "../components/auth/LoginForm";
import { FaCar, FaShieldAlt, FaUserCheck } from "react-icons/fa"; // Icons for features

const LoginPage = () => {
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
          Your trusted vehicle <br /> marketplace
        </h1>

        <p className="text-lg text-slate-500 mb-12 max-w-lg">
          Secure platform for buying, selling, and managing vehicle records with confidence.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaShieldAlt className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Verified vehicle history</h3>
              <p className="text-sm text-slate-500">Access comprehensive vehicle documentation</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaCar className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Fast and secure transactions</h3>
              <p className="text-sm text-slate-500">Seamless buying and selling process</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-green-100 rounded-full">
              <FaUserCheck className="text-green-600 text-sm" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Trusted Community</h3>
              <p className="text-sm text-slate-500">Connect with verified dealers and buyers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-6">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
