// src/layout/UserLayout.jsx
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/scroll/ScrollToTop";

export default function UserLayout() {
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <div className="pt-20 min-h-[80vh]"> {/* Leave room above footer */}
        <Outlet />
      </div>
      <Footer />
    </>
  );
}
