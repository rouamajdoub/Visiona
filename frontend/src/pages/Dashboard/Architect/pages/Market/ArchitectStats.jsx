import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import "./Market.css";
const StatCard = ({ title, value, icon, color }) => (
  <Card className="prd-stat-card">
    <CardContent className="prd-stat-content">
      <div
        className="prd-stat-icon-container"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <div className="prd-stat-text">
        <Typography variant="body2" className="prd-stat-title">
          {title}
        </Typography>
        <Typography variant="h5" className="prd-stat-value">
          {value}
        </Typography>
      </div>
    </CardContent>
  </Card>
);

const ArchitectStats = ({ statsData, loading, error }) => {
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [ratingChartData, setRatingChartData] = useState([]);

  useEffect(() => {
    if (statsData) {
      // Prepare category chart data
      const categoryData = statsData.products.byCategory.map((cat) => ({
        id: cat.name,
        label: cat.name,
        value: cat.count,
      }));
      setCategoryChartData(categoryData);

      // Prepare rating distribution chart data
      const ratingData = [
        { rating: "1 Star", count: statsData.reviews.distribution[1] },
        { rating: "2 Stars", count: statsData.reviews.distribution[2] },
        { rating: "3 Stars", count: statsData.reviews.distribution[3] },
        { rating: "4 Stars", count: statsData.reviews.distribution[4] },
        { rating: "5 Stars", count: statsData.reviews.distribution[5] },
      ];
      setRatingChartData(ratingData);
    }
  }, [statsData]);

  if (loading) {
    return (
      <Box className="prd-stats-loading">
        <CircularProgress color="secondary" />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className="prd-stats-error">
        {error}
      </Alert>
    );
  }

  if (!statsData) {
    return (
      <Alert severity="info" className="prd-stats-no-data">
        No statistics available. Please check back later.
      </Alert>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box className="prd-stats-container">
      <Grid container spacing={3}>
        {/* Key Stats Cards */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Sales"
            value={formatCurrency(statsData.sales.totalSales)}
            icon={
              <MonetizationOnOutlinedIcon
                className="prd-stat-icon"
                style={{ color: "#ff919d" }}
              />
            }
            color="#ff919d"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Products"
            value={statsData.products.total}
            icon={
              <ShoppingBagOutlinedIcon
                className="prd-stat-icon"
                style={{ color: "#36a2eb" }}
              />
            }
            color="#36a2eb"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Orders"
            value={statsData.sales.totalOrders}
            icon={
              <ShoppingCartOutlinedIcon
                className="prd-stat-icon"
                style={{ color: "#ffcd56" }}
              />
            }
            color="#ffcd56"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Avg. Rating"
            value={statsData.reviews.averageRating.toFixed(1) + " ★"}
            icon={
              <StarOutlineIcon
                className="prd-stat-icon"
                style={{ color: "#4bc0c0" }}
              />
            }
            color="#4bc0c0"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Card className="prd-chart-card">
            <CardContent>
              <Typography variant="h6" className="prd-chart-title">
                Products by Category
              </Typography>
              <Box className="prd-chart-container" style={{ height: 300 }}>
                {categoryChartData.length > 0 ? (
                  <ResponsivePie
                    data={categoryChartData}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={{ scheme: "nivo" }}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", 0.2]],
                    }}
                    arcLabel={(e) => `${e.id}: ${e.value}`}
                    enableArcLinkLabels={false}
                    theme={{
                      tooltip: {
                        container: {
                          background: "#333",
                          color: "#fff",
                        },
                      },
                    }}
                  />
                ) : (
                  <Skeleton variant="rectangular" height={300} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="prd-chart-card">
            <CardContent>
              <Typography variant="h6" className="prd-chart-title">
                Rating Distribution
              </Typography>
              <Box className="prd-chart-container" style={{ height: 300 }}>
                {ratingChartData.length > 0 ? (
                  <ResponsiveBar
                    data={ratingChartData}
                    keys={["count"]}
                    indexBy="rating"
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                    padding={0.3}
                    colors={{ scheme: "nivo" }}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Rating",
                      legendPosition: "middle",
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Number of Reviews",
                      legendPosition: "middle",
                      legendOffset: -40,
                    }}
                    theme={{
                      tooltip: {
                        container: {
                          background: "#333",
                          color: "#fff",
                        },
                      },
                    }}
                  />
                ) : (
                  <Skeleton variant="rectangular" height={300} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Card className="prd-top-products-card">
            <CardContent>
              <Typography variant="h6" className="prd-chart-title">
                Top Rated Products
              </Typography>
              <Box className="prd-top-products-container">
                {statsData.products.topRated.length > 0 ? (
                  <Grid container spacing={2}>
                    {statsData.products.topRated.map((product, index) => (
                      <Grid item xs={12} md={6} key={product._id || index}>
                        <Card className="prd-top-product-item">
                          <CardContent className="prd-top-product-content">
                            <Typography
                              variant="body1"
                              className="prd-top-product-title"
                            >
                              {product.title}
                            </Typography>
                            <Box className="prd-top-product-rating">
                              <Typography variant="body2">
                                {product.averageRating.toFixed(1)} ★
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                ({product.totalReviews} reviews)
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    No rated products yet.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ArchitectStats;
