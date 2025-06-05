import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../../redux/slices/authSlice";
import "./Sidebar.css";
import Logo from "../../img/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faAngleLeft,
  faUsers,
  faSignOutAlt,
  faCrown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  faTachometerAlt,
  faUser,
  faCalendar,
  faProjectDiagram,
  faStore,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";

const menuItems = [
  { title: "Dashboard", icon: faTachometerAlt, view: "dashboard" },
  { title: "Clients", icon: faUsers, view: "client" },
  { title: "Calendar", icon: faCalendar, view: "calendar" },
  { title: "Projects", icon: faProjectDiagram, view: "projects" },
  { title: "Tasks", icon: faProjectDiagram, view: "kanban" },
  { title: "Profile", icon: faUser, view: "profile" },
  { title: "Quotes", icon: faFileInvoiceDollar, view: "quote" },
  { title: "Market", icon: faStore, view: "market" },
];

const Sidebar = ({ expanded, setExpanded, selectedItem, setSelectedItem }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto-collapse on mobile when screen size changes
      if (window.innerWidth <= 768) {
        setExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [setExpanded]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && expanded) {
        const sidebar = document.querySelector(".sidebar");
        const toggleBtn = document.querySelector(".toggle-btn");

        if (
          sidebar &&
          !sidebar.contains(event.target) &&
          toggleBtn &&
          !toggleBtn.contains(event.target)
        ) {
          setExpanded(false);
        }
      }
    };

    if (isMobile && expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, expanded, setExpanded]);

  // Close sidebar when clicking on a menu item on mobile
  const handleMenuItemClick = (view) => {
    setSelectedItem(view);
    if (isMobile) {
      setExpanded(false);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleUpgrade = () => {
    navigate("/subs");
    if (isMobile) {
      setExpanded(false);
    }
  };

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  // Get sidebar width based on state and screen size
  const getSidebarWidth = () => {
    if (isMobile) {
      return expanded ? 280 : 0;
    }
    return expanded ? 250 : 80;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`sidebar-overlay ${expanded ? "active" : ""}`}
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      {isMobile && (
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={expanded ? faTimes : faBars} />
        </button>
      )}

      <motion.div
        className={`sidebar ${expanded ? "" : "collapsed"}`}
        initial={false}
        animate={{
          width: getSidebarWidth(),
          x: isMobile && !expanded ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Desktop Toggle Button */}
        {!isMobile && (
          <div className="toggle-btn" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={expanded ? faAngleLeft : faBars} />
          </div>
        )}

        <div className="logo">
          <motion.img
            src={Logo}
            alt="logo"
            initial={false}
            animate={{
              width: isMobile ? 90 : expanded ? 90 : 0,
              opacity: isMobile ? 1 : expanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="menu-scrollable">
          <div className="menu">
            {menuItems.map((item, index) => (
              <motion.div
                className={
                  selectedItem === item.view ? "menuItem active" : "menuItem"
                }
                key={index}
                onClick={() => handleMenuItemClick(item.view)}
                whileHover={expanded || isMobile ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <FontAwesomeIcon icon={item.icon} />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: expanded || isMobile ? 1 : 0,
                    width: expanded || isMobile ? "auto" : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="bottom-actions">
          <motion.button
            className="upgrade-btn"
            onClick={handleUpgrade}
            whileHover={expanded || isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faCrown} />
            <motion.span
              initial={false}
              animate={{
                opacity: expanded || isMobile ? 1 : 0,
                width: expanded || isMobile ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              Upgrade
            </motion.span>
          </motion.button>

          <motion.button
            className="logout-btn"
            onClick={handleLogout}
            whileHover={expanded || isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <motion.span
              initial={false}
              animate={{
                opacity: expanded || isMobile ? 1 : 0,
                width: expanded || isMobile ? "auto" : 0,
              }}
              transition={{ duration: 0.2 }}
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
