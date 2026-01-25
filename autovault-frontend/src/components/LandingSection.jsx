import React from "react";
import { Typewriter } from "react-simple-typewriter";
import blueCar from "../assets/landing_assests/bluecar.png";

export default function LandingSection() {
  return (
    <section className="relative w-screen overflow-hidden bg-gradient-hero px-4 md:px-20 lg:px-2 pb-40 pt-28 -mt-6">
      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 lg:px-12 relative z-10">
        {/* Main Content Row */}
        <div className="flex flex-col lg:flex-row justify-between items-center py-12 gap-8">
          {/* Left Text Content */}
          <div className="w-full lg:w-1/2 space-y-6 animate-slideInLeft">
            <h1 className="font-heading text-4xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              <Typewriter
                words={[
                  "Explore 1000+ Premium Cars",
                  "Rent Your Dream Car Today",
                  "Drive Luxury with Confidence",
                  "Your Journey Starts Here",
                ]}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={2000}
              />
            </h1>
            <p className="text-white/90 text-base md:text-lg leading-relaxed drop-shadow-md max-w-xl">
              Choose from a wide range of premium vehicles and enjoy a smooth,
              stress-free rental experience. From economy to luxury, we've got your perfect ride.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="bg-gradient-secondary text-white font-semibold px-8 py-4 rounded-full shadow-premium hover:shadow-glow-orange transition-all duration-300 transform hover:scale-105">
                Browse Vehicles
              </button>
              <button className="glass text-white font-semibold px-8 py-4 rounded-full hover:bg-white/25 transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-6">
              <div className="text-white">
                <div className="font-heading text-3xl font-bold text-accent">1000+</div>
                <div className="text-sm text-white/80">Vehicles Available</div>
              </div>
              <div className="text-white">
                <div className="font-heading text-3xl font-bold text-accent">50k+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-white">
                <div className="font-heading text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-white/80">Customer Support</div>
              </div>
            </div>
          </div>

          {/* Right Image with hover info */}
          <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 flex justify-center items-center group animate-slideInRight">
            <img
              src={blueCar}
              alt="Premium Car"
              className="relative z-10 w-full max-w-2xl object-contain drop-shadow-2xl animate-float"
            />

            {/* Enhanced Info card on hover */}
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-95">
              <div className="glass-dark backdrop-blur-xl rounded-2xl px-6 py-5 w-80 shadow-premium border border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading text-xl font-bold text-white">Porsche 911 Carrera</h3>
                  <span className="bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full">Premium</span>
                </div>
                <p className="text-sm text-white/70 mb-3">Blue · 2023 Model · Automatic</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-heading font-bold text-accent">$150<span className="text-sm text-white/60">/day</span></p>
                  </div>
                  <button className="bg-gradient-secondary text-white text-sm font-semibold px-5 py-2 rounded-full hover:shadow-glow-orange transition-all duration-300">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
