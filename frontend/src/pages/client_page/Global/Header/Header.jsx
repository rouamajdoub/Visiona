import { useState } from "react";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBars,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { logoutUser } from "../../../../redux/slices/authSlice";
import logo from "../../img/logo-alt.png";
import logo2 from "../../img/logo-alt.png";
import "./Header.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
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
            <button className="clt_logout_btn" onClick={handleLogout}>
              <FontAwesomeIcon
                icon={faSignOutAlt}
                className="clt_logout_icon"
              />
              Logout
            </button>
            <button className="clt_btn_visiona">
              <a href="/Profile">My Visiona</a>
            </button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="clt_nav_mobile">
            <nav className="clt_nav_mobile_inner">
              <button className="clt_logout_btn" onClick={handleLogout}>
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  className="clt_logout_icon"
                />
                Logout
              </button>
              <button className="clt_btn_visiona">
                <a href="/Profile">My Visiona</a>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
