import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "../../img/logo.png";
import logo2 from "../../img/logo.png";
import "./Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="clt_header">
      <div className="clt_header_topbar">
        <img src={logo2} alt="Logo" className="clt_logo_small" />
        <p className="clt_header_motto">
          Enhance Your Space, Elevate Your Style
        </p>
        <div className="clt_header_cta">
          <p>Get started</p>
          <FontAwesomeIcon icon={faArrowRight} className="clt_header_icon" />
        </div>
      </div>

      <div className="clt_header_main">
        <div className="clt_header_container">
          <img src={logo} alt="Logo" className="clt_logo_main" />
          <button
            onClick={toggleMobileMenu}
            className="clt_menu_button"
            aria-label="Toggle mobile menu"
          >
            <FontAwesomeIcon icon={faBars} className="clt_menu_icon" />
          </button>

          <nav className="clt_nav_desktop">
            <button onClick={() => scrollToSection("hero")}>About</button>
            <button onClick={() => scrollToSection("productShowcase")}>
              Features
            </button>
            <button onClick={() => scrollToSection("testimonials")}>
              Customers
            </button>
            <button onClick={() => scrollToSection("pricing")}>Pricing</button>
            <button onClick={() => scrollToSection("faq")}>FAQ</button>
            <button
              onClick={() => scrollToSection("callToAction")}
              className="clt_btn_primary"
            >
              Start Now
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="clt_nav_mobile">
            <nav className="clt_nav_mobile_inner">
              <button onClick={() => scrollToSection("hero")}>About</button>
              <button onClick={() => scrollToSection("productShowcase")}>
                Features
              </button>
              <button onClick={() => scrollToSection("testimonials")}>
                Customers
              </button>
              <button onClick={() => scrollToSection("pricing")}>
                Pricing
              </button>
              <button onClick={() => scrollToSection("faq")}>FAQ</button>
              <button
                onClick={() => scrollToSection("callToAction")}
                className="clt_btn_primary"
              >
                Start Now
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
