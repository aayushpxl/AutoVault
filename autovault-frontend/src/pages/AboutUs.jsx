import React from "react";
import { motion } from "framer-motion";
import {
  FaCarAlt,
  FaRocket,
  FaRegHandshake,
  FaRegClock,
  FaRegStar,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-gray-100 to-white py-20 px-6 md:px-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.2 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto"
      >
        {/* Hero Section */}
        <motion.div
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Drive Freedom, Rent Smarter
          </h1>
          <p className="text-gray-600 mt-4 text-lg max-w-2xl mx-auto">
            Welcome to RentEasy — your modern gateway to renting vehicles
            effortlessly, affordably, and on your terms.
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-20"
        >
          {[
            { icon: <FaCarAlt />, label: "2,500+ Cars" },
            { icon: <FaMapMarkedAlt />, label: "120+ Cities" },
            { icon: <FaRegClock />, label: "24/7 Support" },
            { icon: <FaRegStar />, label: "4.9★ Avg Rating" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="text-3xl text-blue-600 mb-3 flex justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {item.label}
              </h3>
            </div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20"
        >
          {[ 
            {
              icon: <FaRocket className="text-pink-500 text-4xl" />, 
              title: "Fast & Flexible",
              desc: "Book within seconds, drive within minutes — our process is lightning fast and hassle-free."
            },
            {
              icon: <FaRegHandshake className="text-green-500 text-4xl" />, 
              title: "Transparent Pricing",
              desc: "No hidden fees, no surprises. What you see is what you pay."
            },
            {
              icon: <FaRegStar className="text-yellow-500 text-4xl" />, 
              title: "Quality Guaranteed",
              desc: "Every vehicle is thoroughly inspected and backed by user reviews."
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          variants={fadeInUp}
          className="bg-black text-white text-center rounded-3xl py-16 px-6 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to hit the road?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Browse, book, and drive. Your perfect ride is just a few clicks away.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition"
          >
            Explore Vehicles
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
