import React from "react";
import Header from "../components/Header/Header";
import MatchSteps from "../components/ai_matching/MatchSteps";
import AbtService from "../components/service-section/abtService";
import ArchitectsHighlight from "../components/ArchitectsHighlight/architectsHl";
import ClientReview from "../components/Review/ClientReview";
import { Footer } from "../components/Footer/Footer";
const Home = () => {
  return (
    <>
      <Header />
      <MatchSteps />
      <AbtService />
      <ArchitectsHighlight />
      <ClientReview />
      <Footer />
    </>
  );
};

export default Home;
