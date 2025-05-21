import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";

// Global components
import Sidebar from "./components/Sidebar";

// Charts
import UserStatisticsChart from "./components/charts/Bar/UserStat";
import ReviewManagementChart from "./components/charts/Bar/ReviewChart";
import UserStatsChart from "./components/charts/line/UserStatsChart";
import ArchitectStatsChart from "./components/charts/Radar/ArchitectStatsChart ";
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
  fetchAllReviews,
  fetchSubscriptions,
  fetchUserStats,
  fetchArchitectRequests,
} from "../../../redux/slices/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { users, reviews, userStats, loading, error } = useSelector(
    (state) => state.admin
  );
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Track sidebar state

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllReviews());
    dispatch(fetchSubscriptions());
    dispatch(fetchUserStats());
    dispatch(fetchArchitectRequests());
  }, [dispatch]);

  const renderStatistics = () => (
    <div className="stats-container">
      <div className="stat-card">
        <UserStatisticsChart data={users} />
      </div>
      <div className="stat-card">
        <ReviewManagementChart productReviews={reviews?.productReviews || []} />
      </div>
      <div className="stat-card">
        <UserStatsChart data={userStats} />
      </div>
      <div className="stat-card">
        <ArchitectStatsChart data={userStats} />
      </div>
    </div>
  );

  return (
    <Box className="custom-background">
      <Sidebar
        setCurrentView={setCurrentView}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <Box
        className={`dashboard-container ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Box>
          <h1>Admin Dashboard</h1>
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
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
