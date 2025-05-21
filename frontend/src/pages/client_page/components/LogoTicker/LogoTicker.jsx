import React from "react";
import "./LogoTicker.css";

// Import images directly
// Note: You'll need to adjust these imports to match your project structure
import acmeLogo from "../../img/Logos/logo-acme.png";
import quantumLogo from "../../img/Logos/logo-quantum.png";
import echoLogo from "../../img/Logos/logo-echo.png";
import celestialLogo from "../../img/Logos/logo-celestial.png";
import pulseLogo from "../../img/Logos/logo-pulse.png";
import apexLogo from "../../img/Logos/logo-apex.png";

export const LogoTicker = () => {
  return (
    <div className="logo-ticker">
      <div className="container">
        <div className="logo-ticker-overflow">
          <div className="logo-ticker-animation">
            <img src={acmeLogo} alt="Acme Logo" className="logo-ticker-image" />
            <img
              src={quantumLogo}
              alt="Quantum Logo"
              className="logo-ticker-image"
            />
            <img src={echoLogo} alt="Echo Logo" className="logo-ticker-image" />
            <img
              src={celestialLogo}
              alt="Celestial Logo"
              className="logo-ticker-image"
            />
            <img
              src={pulseLogo}
              alt="Pulse Logo"
              className="logo-ticker-image"
            />
            <img src={apexLogo} alt="Apex Logo" className="logo-ticker-image" />

            {/* Second set of logos for animation */}
            <img src={acmeLogo} alt="Acme Logo" className="logo-ticker-image" />
            <img
              src={quantumLogo}
              alt="Quantum Logo"
              className="logo-ticker-image"
            />
            <img src={echoLogo} alt="Echo Logo" className="logo-ticker-image" />
            <img
              src={celestialLogo}
              alt="Celestial Logo"
              className="logo-ticker-image"
            />
            <img
              src={pulseLogo}
              alt="Pulse Logo"
              className="logo-ticker-image"
            />
            <img src={apexLogo} alt="Apex Logo" className="logo-ticker-image" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;
