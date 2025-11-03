import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
    </div>
  );
};
