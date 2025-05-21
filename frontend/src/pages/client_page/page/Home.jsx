import React from "react";
import Header from "../Global/Header/Header";
import MatchSteps from "../components/ai_matching/MatchSteps";
import AbtService from "../components/service-section/abtService";
import ArchitectsHighlight from "../components/ArchitectsHighlight/architectsHl";
import ClientReview from "../components/Review/ClientReview";
import MarketSection from "../components/MarketSection/MarketSection";
import LogoTicker from "../components/LogoTicker/LogoTicker";
import { Footer } from "../components/Footer/Footer";
import HeroSection from "../components/HeroSection/HeroSection";
const Home = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <MatchSteps />
      <AbtService />
      <MarketSection />
      <LogoTicker />
      <ArchitectsHighlight />
      <ClientReview />
      <Footer />
    </>
  );
};

export default Home;
