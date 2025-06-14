import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const COLORS = ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"];

const RejectionReasonsChart = ({ rejectionReasons, loading, error }) => {
  // Get rejection reasons data
  const prepareRejectionData = () => {
    if (!rejectionReasons || rejectionReasons.length === 0) return [];

    // Sort rejection reasons by count and prepare for pie chart
    return [...rejectionReasons]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Take top 5 reasons
      .map((reason) => ({
        name: reason.reason,
        value: reason.count,
      }));
  };

  const rejectionData = prepareRejectionData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>
            {data.payload.value} rejections
          </p>
          <p style={{ margin: "4px 0 0 0", color: "#666" }}>
            Reason: {data.payload.name}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="250px"
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
        height="250px"
        sx={{ backgroundColor: "transparent" }}
      >
        <Typography color="error">
          Error loading rejection data:{" "}
          {error?.message || JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Card elevation={3} sx={{ backgroundColor: "transparent" }}>
      <CardContent sx={{ backgroundColor: "transparent" }}>
        <Typography variant="h6" gutterBottom>
          Top Rejection Reasons
        </Typography>

        {rejectionData.length > 0 ? (
          <Box height={300} sx={{ backgroundColor: "transparent" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ backgroundColor: "transparent" }}>
                <Pie
                  data={rejectionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rejectionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="250px"
            sx={{ backgroundColor: "transparent" }}
          >
            <Typography variant="body2" color="textSecondary">
              No rejection data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RejectionReasonsChart;
