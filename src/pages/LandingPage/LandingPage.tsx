import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { Features } from "@/components/Features/Features";

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <Features />
    </div>
  );
};
