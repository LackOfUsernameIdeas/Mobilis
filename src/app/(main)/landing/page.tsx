"use client";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Footer from "./components/Footer";
import { features } from "./constants";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection features={features} />
      <Footer />
    </div>
  );
}
