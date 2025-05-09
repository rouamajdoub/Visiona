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

  return (
    <header className="clt_header">
      <div className="clt_header_topbar">
        <img src={logo2} alt="Logo" className="clt_logo_small" />
        <p className="clt_header_motto">
          Enhance Your Space, Elevate Your Style
        </p>
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
            <button>Home</button>
            <button>Shop </button>
            <button>Need Sheet</button>
            <button>Logout</button>
            <button className="clt_btn_primary">
              <a href="/Profile">My Account</a>
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="clt_nav_mobile">
            <nav className="clt_nav_mobile_inner">
              <button>Home</button>
              <button>Shop</button>
              <button>Need Sheet</button>
              <button>Logout</button>
              <button className="clt_btn_primary">
                <a href="/Profile">My Account</a>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
