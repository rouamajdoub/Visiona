import React from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../img/logo.png";
import "../style.css";

const Header = ({ onNavClick }) => {
  const { pathname } = useLocation();

  const getPageName = () => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/projects":
        return "Projects";
      case "/architects":
        return "Architects";
      case "/my-favorites":
        return "My Favorites";
      default:
        return "Unknown Page";
    }
  };

  return (
    <motion.header
      className="h-header"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="h-logo" onClick={onNavClick}>
        <img src={Logo} alt="logo" width={45} height={45} />
      </Link>

      <h2 className="h-page-name">{getPageName()}</h2>

      <ul className="h-nav-list">
        {["/projects", "/architects", "/my-favorites"].map((path) => (
          <li key={path}>
            <Link
              to={path}
              className={`h-nav-item ${pathname === path ? "active" : ""}`}
              onClick={onNavClick}
            >
              {path
                .replace("/", "")
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Link>
          </li>
        ))}
      </ul>
    </motion.header>
  );
};

export default Header;
