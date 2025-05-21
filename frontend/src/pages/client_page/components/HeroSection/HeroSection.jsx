import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import "./HeroSection.css";
import V from "../../img/logo.mp4";

const HeroSection = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener("loadeddata", () => {
        console.log("Video loaded successfully");
      });

      videoRef.current.addEventListener("error", (e) => {
        console.error("Error loading video:", e);
      });

      const playVideo = async () => {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Error playing video:", err);
        }
      };

      playVideo();
    }
  }, []);

  return (
    <div className="hero-container">
      <video
        className="hero-video"
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        width="100%"
        height="100%"
      >
        <source src={V} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="video-fallback"></div>
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1>Welcome to Visiona </h1>
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
