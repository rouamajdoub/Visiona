import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import { LogoutOutlined, HomeOutlined } from "@mui/icons-material";

// Global components
import Sidebar from "./components/Sidebar";

// Charts
import UserStatisticsChart from "./components/charts/Bar/UserStat";
import UserStatsChart from "./components/charts/line/UserStatsChart";
import ArchitectStatsChart from "./components/charts/Radar/ArchitectStatsChart ";
import RejectionReasonsChart from "./components/charts/Pie/RejectionReasonsChart";

// Management pages
import ReviewManagement from "./pages/ReviewManagement";
import UserManagement from "./pages/UserManagement";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import ArchitectRequests from "./pages/ArchiSignUpReq";
import ArchitectApprovalPage from "./pages/ArchitectApprovalPage";
import ServiceManagement from "./pages/ServiceManagement";
import CertificationManagement from "./pages/CertificationManagement";
import SoftwareSkillsManagement from "./pages/SoftwareSkillsManagement";
import CategoryManagement from "./pages/CategoryManagement";

// CSS
import "./css/style.css";

// Redux actions
import {
  fetchUsers,
  fetchSubscriptions,
  fetchUserStats,
  fetchArchitectRequests,
  fetchArchitectStats,
} from "../../../redux/slices/adminSlice";
import { logoutUser } from "../../../redux/slices/authSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, userStats, architectStats, loading, error } = useSelector(
    (state) => state.admin
  );
  const { user } = useSelector((state) => state.auth);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchSubscriptions());
    dispatch(fetchUserStats());
    dispatch(fetchArchitectRequests());
    dispatch(fetchArchitectStats());
  }, [dispatch]);

  // Function to get page title based on current view
  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      reviews: "Review Management",
      users: "User Management",
      subscriptions: "Subscription Management",
      "1sign-up-req": "Architect Requests",
      services: "Service Management",
      certifications: "Certification Management",
      skills: "Software Skills Management",
      "Market-CAT": "Category Management",
      "sign-up-req": "Architect Approval",
    };
    return titles[currentView] || "Dashboard";
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const renderStatistics = () => (
    <div className="stats-container">
      {/* Top Row - 3 equal cards */}
      <div className="stats-top-row">
        {/* User Statistics Chart Card */}
        <div className="stat-card stat-card-small">
          <div className="chart-container">
            <UserStatisticsChart data={users} />
          </div>
        </div>

        {/* Rejection Reasons Pie Chart Card */}
        <div className="stat-card stat-card-small">
          <div className="chart-container">
            <RejectionReasonsChart
              rejectionReasons={architectStats?.rejectionReasons}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Architect Radar Chart Card */}
        <div className="stat-card stat-card-small">
          <div className="chart-container">
            <ArchitectStatsChart data={userStats} />
          </div>
        </div>
      </div>

      {/* Bottom Row - Full width card */}
      <div className="stats-bottom-row">
        <div className="stat-card stat-card-wide">
          <div className="chart-container">
            <UserStatsChart data={userStats} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Box className="custom-background">
      <Sidebar
        setCurrentView={setCurrentView}
        setIsCollapsed={setIsSidebarCollapsed}
        className="sidebar"
      />

      {/* Admin Header */}
      <div
        className={`admin-header ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div>
          <h1>{getPageTitle()}</h1>
          <div className="breadcrumb">
            <HomeOutlined fontSize="small" />
            <span>Home</span>
            <span className="breadcrumb-separator">/</span>
            <span>{getPageTitle()}</span>
          </div>
        </div>

        <div className="header-right">
          {user && (
            <div className="user-info">
              <div className="user-name">
                {user.firstName} {user.lastName}
              </div>
              <div className="user-role">{user.role}</div>
            </div>
          )}

          <Button
            className="logout-btn"
            onClick={handleLogout}
            startIcon={<LogoutOutlined />}
          >
            Logout
          </Button>
        </div>
      </div>

      <div
        className={`dashboard-container ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="dashboard-content">
          {loading && <CircularProgress />}
          {error && (
            <Typography color="error">
              {typeof error === "string" ? error : "An error occurred"}
            </Typography>
          )}
          {currentView === "dashboard" && renderStatistics()}
          {currentView === "reviews" && <ReviewManagement />}
          {currentView === "users" && <UserManagement />}
          {currentView === "subscriptions" && <SubscriptionManagement />}
          {currentView === "1sign-up-req" && <ArchitectRequests />}
          {currentView === "services" && <ServiceManagement />}
          {currentView === "certifications" && <CertificationManagement />}
          {currentView === "skills" && <SoftwareSkillsManagement />}
          {currentView === "Market-CAT" && <CategoryManagement />}
          {currentView === "sign-up-req" && <ArchitectApprovalPage />}
        </div>
      </div>
    </Box>
  );
};

export default AdminDashboard;
