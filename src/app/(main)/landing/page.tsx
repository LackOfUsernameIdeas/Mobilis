"use client";

import React from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import { features, benefits } from "./constants";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection benefits={benefits} />
      <FeaturesSection features={features} />
      <CTASection />
      <Footer />
    </div>
  );
}
