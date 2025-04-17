import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// Global components
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Charts
import UserStatisticsChart from "./components/charts/Bar/UserStat";
import ReviewManagementChart from "./components/charts/Bar/ReviewChart";
import UserStatsChart from "./components/charts/line/UserStatsChart";

// Management pages
import ReviewManagement from "./pages/ReviewManagement";
import UserManagement from "./pages/UserManagement";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import ArchiSignUpReq from "./pages/ArchiSignUpReq";

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

  const renderArchitectRequests = () => (
    <div className="table-container">
      <Typography variant="h6" gutterBottom>
        Architect Sign-Up Requests
      </Typography>
    </div>
  );

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
        <Topbar />
        <Box>
          <Header title="Admin Dashboard" />
          {loading && <CircularProgress />}
          {error && <Typography color="error">{error}</Typography>}
          {currentView === "dashboard" && (
            <>
              {renderArchitectRequests()}
              {renderStatistics()}
            </>
          )}
          {currentView === "reviews" && <ReviewManagement />}
          {currentView === "users" && <UserManagement />}
          {currentView === "subscriptions" && <SubscriptionManagement />}
          {currentView === "sign-up-req" && <ArchiSignUpReq />}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
