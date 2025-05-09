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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="250px"
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
      >
        <Typography color="error">
          Error loading rejection data:{" "}
          {error?.message || JSON.stringify(error)}
        </Typography>
      </Box>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Rejection Reasons
        </Typography>

        {rejectionData.length > 0 ? (
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rejectionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
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
                <Tooltip
                  formatter={(value) => [`${value} rejections`, "Count"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="250px"
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
