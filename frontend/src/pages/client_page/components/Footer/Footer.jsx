import React, { useState } from "react";
import "./footer.css";
import logo from "../../img/logo2.png";
import SocialX from "../../img/logo.png";
import SocialInsta from "../../img/logo.png";

export const Footer = () => {
  // Footer navigation links organized by categories
  const footerLinks = {
    Company: [{ name: "Learn More", href: "/about" }],
    Products: [
      { name: "Shop", href: "/shop" },
      { name: "What's New", href: "/trending" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Compliance", href: "#" },
    ],
  };

  // Get categories as an array
  const categories = Object.keys(footerLinks);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Logo and company info */}
          <div className="footer-company">
            <div className="footer-logo">
              <div className="logo-glow">
                <div className="logo-image">
                  <img src={logo} alt="Visiona Logo" width="70" height="70" />
                </div>
              </div>
              <span className="logo-text">Visiona</span>
            </div>
            <p className="company-description">
              Visiona is your smart gateway to exceptional interior design. We
              connect clients with talented architects through a seamless,
              AI-powered platform. Discover, collaborate, and bring your dream
              space to life with Visiona.
            </p>
            <div className="company-description">
              Contact us at:
              <a
                href="mailto:visiona407@gmail.com"
                className="company-description"
              >
                visiona407@gmail.com
              </a>
            </div>
            <div className="social-links">
              <a href="#" aria-label="X Social Media" className="social-link">
                <img
                  src={SocialX}
                  alt="X Social Media"
                  className="social-icon"
                />
              </a>
              <a href="#" aria-label="Instagram" className="social-link">
                <img
                  src={SocialInsta}
                  alt="Instagram"
                  className="social-icon"
                />
              </a>
            </div>
          </div>

          {/* Navigation categories */}
          {categories.map((category) => (
            <div key={category} className="footer-links-column">
              <h3 className="footer-category">{category}</h3>
              <ul className="footer-links-list">
                {footerLinks[category].map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright and attribution */}
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Visiona, Inc. All rights reserved.
          </p>
          <div className="footer-legal-links">
            <a href="#" className="legal-link">
              Privacy
            </a>
            <a href="#" className="legal-link">
              Terms
            </a>
            <a href="#" className="legal-link">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
