import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";
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
        sx={{ backgroundColor: "transparent" }}
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
        sx={{ backgroundColor: "transparent" }}
      >
        <Typography color="error">
          Error loading architect statistics:{" "}
          {error?.message || JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "transparent" }}>
      <Typography variant="h6" gutterBottom sx={{ color: "black", mb: 2 }}>
        Architect Registration Statistics
      </Typography>

      <Grid container spacing={2}>
        {/* Stats Summary */}
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", color: "black" }}
            >
              Total Architects: {architectStats?.total || 0}
            </Typography>
            <Typography sx={{ color: "black" }}>
              Pending: {architectStats?.pending || 0}
            </Typography>
            <Typography sx={{ color: "black" }}>
              Approved: {architectStats?.approved || 0}
            </Typography>
            <Typography sx={{ color: "black" }}>
              Rejected: {architectStats?.rejected || 0}
            </Typography>
          </Box>
        </Grid>

        {/* Radar Chart */}
        <Grid item xs={12} md={8}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart
              outerRadius={120}
              data={radarData}
              style={{ backgroundColor: "transparent" }}
            >
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
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #ccc",
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ArchitectStatsChart;
