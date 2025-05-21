import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container, Paper, Typography, Tabs, Tab } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ArchitectStats from "./ArchitectStats";
import ProductManagement from "./ProductManagement";
import OrdersManagement from "./OrdersManagement";
import CategoriesManagement from "./CategoriesManagement";
import { fetchArchitectStats } from "../../../../../redux/slices/marketplaceSlice";
import "./Market.css";

const Market = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const {
    loading,
    error,
    data: statsData,
  } = useSelector((state) => state.marketplace.stats);

  useEffect(() => {
    dispatch(fetchArchitectStats());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <ArchitectStats
            statsData={statsData}
            loading={loading}
            error={error}
          />
        );
      case 1:
        return <ProductManagement />;
      case 2:
        return <OrdersManagement />;
      case 3:
        return <CategoriesManagement />;
      default:
        return (
          <ArchitectStats
            statsData={statsData}
            loading={loading}
            error={error}
          />
        );
    }
  };

  return (
    <Container maxWidth="xl" className="mkt-dashboard-container">
      <Paper elevation={0} className="mkt-dashboard-header">
        <Typography variant="h4" className="mkt-dashboard-title">
          Architect Dashboard
        </Typography>
        <Typography variant="subtitle1" className="mkt-dashboard-subtitle">
          Manage your marketplace activities
        </Typography>
      </Paper>

      <Box className="mkt-dashboard-tabs-container">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          className="mkt-dashboard-tabs"
          TabIndicatorProps={{ className: "mkt-tab-indicator" }}
        >
          <Tab
            icon={<DashboardOutlinedIcon />}
            label="Dashboard"
            className={`mkt-dashboard-tab ${
              activeTab === 0 ? "mkt-active-tab" : ""
            }`}
          />
          <Tab
            icon={<ShoppingBagOutlinedIcon />}
            label="Products"
            className={`mkt-dashboard-tab ${
              activeTab === 1 ? "mkt-active-tab" : ""
            }`}
          />
          <Tab
            icon={<ShoppingCartOutlinedIcon />}
            label="Orders"
            className={`mkt-dashboard-tab ${
              activeTab === 2 ? "mkt-active-tab" : ""
            }`}
          />
          <Tab
            icon={<CategoryOutlinedIcon />}
            label="Categories"
            className={`mkt-dashboard-tab ${
              activeTab === 3 ? "mkt-active-tab" : ""
            }`}
          />
        </Tabs>
      </Box>

      <Box className="mkt-tab-content">{renderTabContent()}</Box>
    </Container>
  );
};

export default Market;
