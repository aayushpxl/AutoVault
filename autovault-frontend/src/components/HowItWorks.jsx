import React from "react";
import howItWorksImg from "../assets/howitworks.png";

export default function BrandsSection() {
  return (
    <section className="w-full py-16 px- bg-white flex justify-center">
      <img
        src={howItWorksImg}
        alt="How it works"
        className="max-w-[670px] h-auto object-contain"
      />
    </section>
  );
}
