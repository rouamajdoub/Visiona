import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { fetchArchitectStats } from "../../../../../../redux/slices/adminSlice";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import RejectionReasonsChart from "../Pie/RejectionReasonsChart";

const ArchitectStatsChart = () => {
  const dispatch = useDispatch();
  const { architectStats, loading, error } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchArchitectStats());
  }, [dispatch]);

  // Prepare data for radar chart
  const prepareRadarData = () => {
    if (!architectStats) return [];

    return [
      {
        subject: "Pending",
        A: architectStats.pending,
        fullMark: architectStats.total,
      },
      {
        subject: "Approved",
        A: architectStats.approved,
        fullMark: architectStats.total,
      },
      {
        subject: "Rejected",
        A: architectStats.rejected,
        fullMark: architectStats.total,
      },
    ];
  };

  const radarData = prepareRadarData();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="300px"
      >
        <Typography color="error">
          Error loading architect statistics:{" "}
          {error?.message || JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Main Stats Card */}
      <Grid item xs={12}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Architect Registration Statistics
            </Typography>

            <Grid container spacing={3}>
              {/* Stats Summary */}
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Total Architects: {architectStats?.total || 0}
                  </Typography>
                  <Typography>
                    Pending: {architectStats?.pending || 0}
                  </Typography>
                  <Typography>
                    Approved: {architectStats?.approved || 0}
                  </Typography>
                  <Typography>
                    Rejected: {architectStats?.rejected || 0}
                  </Typography>
                </Box>
              </Grid>

              {/* Radar Chart */}
              <Grid item xs={12} md={8}>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart outerRadius={150} data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar
                      name="Architect Status"
                      dataKey="A"
                      stroke="#4caf50"
                      fill="#4caf50"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Rejection Reasons Pie Chart in a separate card */}
      <Grid item xs={12} md={6}>
        <RejectionReasonsChart
          rejectionReasons={architectStats?.rejectionReasons || []}
          loading={loading}
          error={error}
        />
      </Grid>
    </Grid>
  );
};

export default ArchitectStatsChart;
