import React from "react";
import Illustration from "../assets/illustration.png";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Side – Illustration */}
      <div className="w-1/2 flex items-center justify-center pr-10" style={{ height: "100vh" }}>
        <div
          className="bg-[#e6f0ff] w-full h-full rounded-r-[222px] flex flex-col justify-center items-center p-10 text-center"
          style={{ boxSizing: "border-box" }}
        >
          <h1 className="text-4xl font-bold text-blue-900 mb-8 leading-tight">
            Welcome to <br />
            <span className="text-blue-600">GadiKhoj</span>
          </h1>
          <img src={Illustration} alt="Illustration" className="max-w-[70%] h-auto" />
        </div>
      </div>

      {/* Right Side – Form */}
      <div className="w-1/2 flex items-center justify-end pr-20">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
