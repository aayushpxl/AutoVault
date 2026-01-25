// src/pages/Home.jsx

import React from 'react';
import Navbar from '../components/Navbar';
import LandingSection from '../components/LandingSection';
import BrandsSection from '../components/BrandSection';
import HowItWorks from '../components/HowItWorks';
import AvailableVehicles from '../components/AvailableVehicles';
import LocationDate from '../components/LocationDate';


export default function HomePage() {
  return (
    <div>
      <LandingSection />
      <LocationDate/>
      <BrandsSection />
      <AvailableVehicles />
      <HowItWorks />
    </div>
  );
}
