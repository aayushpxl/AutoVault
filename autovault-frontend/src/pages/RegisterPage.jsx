// src/pages/Register.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import Logo from "../assets/autovaultlogo.png";
import Illustration from "../assets/illustration.png";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div
        className="w-1/2 flex items-center justify-center pr-10"
        style={{ paddingLeft: 0, height: "100vh" }}
      >
        <div
          className="bg-[#e6f0ff] w-full h-full rounded-r-[222px] flex flex-col justify-center items-center p-10 text-center"
          style={{ boxSizing: "border-box" }}
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-8 leading-tight">
            Join <br /> <span className="text-blue-600">GadiKhoj</span>
          </h1>
          <img
            src={Illustration}
            alt="Illustration"
            className="max-w-[70%] h-auto"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col items-center justify-center pr-1">
        <img src={Logo} alt="Gadi Khoj Logo" className="w-40 mb-1" />

        <h2 className="text-3xl font-bold mb-9">Sign up to get started</h2>

        <RegisterForm />

        <p className="text-sm text-gray-700 text-center mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
