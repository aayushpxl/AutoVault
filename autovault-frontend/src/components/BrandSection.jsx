import React from 'react';
import bmwLogo from '../assets/BrandSection/BMW.png';
import fordLogo from '../assets/BrandSection/ford.png';
import mercLogo from '../assets/BrandSection/mercedes.png';
import peugeotLogo from '../assets/BrandSection/peugeot.png';
import vwLogo from '../assets/BrandSection/volkswagen.png';
import hyundaiLogo from '../assets/BrandSection/hyundaiLogo.png';
import toyotaLogo from '../assets/BrandSection/toyotaLogo.png';

const brands = [
  { name: 'BMW', logo: bmwLogo },
  { name: 'Ford', logo: fordLogo },
  { name: 'Mercedes Benz', logo: mercLogo },
  { name: 'Peugeot', logo: peugeotLogo },
  { name: 'Volkswagen', logo: vwLogo },
  { name: 'Hyundai', logo: hyundaiLogo },
  { name: 'Toyota', logo: toyotaLogo },
];

export default function BrandsSection() {
  return (
    <section className="bg-surface py-20 px-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-secondary"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="gradient-text">Explore Our Premium Brands</span>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Discover vehicles from the world's most trusted automotive brands
        </p>

        <div className="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
          {brands.map((brand, index) => (
            <div
              key={index}
              className="w-28 flex flex-col items-center text-sm font-medium text-dark group cursor-pointer"
            >
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg mb-4 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-3 border border-slate-200">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-center font-semibold group-hover:text-primary transition-colors duration-300">
                {brand.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
