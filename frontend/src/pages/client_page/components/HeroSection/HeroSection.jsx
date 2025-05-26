import React from "react";
import "./HeroSection.css";
import HeroImage from "../../img/logo.png"; // Make sure to use a valid image format like .jpg or .png

const HeroSection = () => {
  return (
    <div className="hero-container">
      <img
        className="hero-image"
        src={HeroImage}
        alt="Hero background"
        width="100%"
        height="100%"
      />

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1>Welcome to Visiona</h1>
        <p>
          Connect with talented interior architects, explore inspiring
          portfolios, and bring your dream space to life. With Visiona, matching
          with the right expert has never been easier. Whether you're
          renovating, redecorating, or starting from scratch — we’re here to
          guide you every step of the way.
        </p>
      </div>
    </div>
  );
};

export default HeroSection;
