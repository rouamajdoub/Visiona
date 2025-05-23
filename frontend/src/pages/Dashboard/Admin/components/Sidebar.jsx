import React, { useState } from "react";
import "react-pro-sidebar/dist/css/styles.css";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "../img/logo.png";
import {
  faHome,
  faUsers,
  faClipboardList,
  faFileInvoiceDollar,
  faCog,
  faConciergeBell,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const menuItems = [
  { title: "Dashboard", icon: faHome, view: "dashboard" },
  { title: "Users", icon: faCog, view: "users" },
  { title: "Architects", icon: faUsers, view: "sign-up-req" },
  { title: "Subscriptions", icon: faFileInvoiceDollar, view: "subscriptions" },
  { title: "Reviews", icon: faClipboardList, view: "reviews" },
  { title: "Category-Market", icon: faClipboardList, view: "Market-CAT" },
  { title: "Product-Market", icon: faClipboardList, view: "MArket-PROD" },
];

const architectOptions = [
  { title: "Services", view: "services" },
  { title: "Certifications", view: "certifications" },
  { title: "Software Skills", view: "skills" },
];

const Sidebar = ({ setCurrentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [showArchitectOptions, setShowArchitectOptions] = useState(false);

  return (
    <Box
      sx={{
        "& .pro-icon-wrapper": { backgroundColor: "transparent !important" },
        "& .pro-inner-item": { padding: "10px 35px !important" }, // Increased padding
        "& .pro-inner-item:hover": { color: "#868dfb !important" },
        "& .pro-menu-item.active": { color: "#6870fa !important" },
        "& .pro-sidebar": {
          height: "100vh !important",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
        },
      }}
      className={isCollapsed ? "sidebar-collapsed" : ""}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* Logo & Toggle Button */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0" }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <img
                  src={logo}
                  alt="Logo"
                  style={{ width: "80px", height: "auto", borderRadius: "8px" }}
                />
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* Sidebar Items */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {menuItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <MenuItem
                  active={selected === item.title}
                  onClick={() => {
                    setSelected(item.title);
                    setCurrentView(item.view);
                  }}
                  icon={<FontAwesomeIcon icon={item.icon} />}
                >
                  <Typography>{item.title}</Typography>
                </MenuItem>
              </motion.div>
            ))}

            {/* Architect Settings Dropdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <MenuItem
                icon={<FontAwesomeIcon icon={faConciergeBell} />}
                onClick={() => setShowArchitectOptions(!showArchitectOptions)}
              >
                <Typography>Architect Settings</Typography>
              </MenuItem>

              {/* Submenu */}
              {showArchitectOptions &&
                architectOptions.map((sub, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuItem
                      style={{ paddingLeft: "40px" }} // Maintain padding for sub-menu items
                      active={selected === sub.title}
                      onClick={() => {
                        setSelected(sub.title);
                        setCurrentView(sub.view);
                      }}
                    >
                      <Typography>{sub.title}</Typography>
                    </MenuItem>
                  </motion.div>
                ))}
            </motion.div>
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
