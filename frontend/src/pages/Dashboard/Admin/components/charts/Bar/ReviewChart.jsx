import React from "react";
import { useTheme, Box, Typography } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";

const ReviewChart = ({ productReviews }) => {
  if (!productReviews || productReviews.length === 0)
    return <Typography>No review data available</Typography>;

  // Aggregate product reviews count by productId
  const productCounts = productReviews.reduce((acc, review) => {
    const productId = review.productId;
    if (productId) {
      // Store the shortest version of productId to make it more readable
      // This takes just the first part of the MongoDB ID if it's a long string
      const displayId =
        productId.length > 8 ? productId.substring(0, 8) + "..." : productId;
      acc[displayId] = (acc[displayId] || 0) + 1;
    }
    return acc;
  }, {});

  // Prepare data for the bar chart
  const chartData = Object.keys(productCounts).map((displayId) => ({
    product: displayId,
    count: productCounts[displayId],
  }));

  // Sort data by review count (descending) and limit to top 8 products
  chartData.sort((a, b) => b.count - a.count);
  const topProducts = chartData.slice(0, 8);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "black", fontWeight: "bold" }}
      >
        Most Reviewed Products
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ResponsiveBar
          data={topProducts}
          keys={["count"]}
          indexBy="product"
          margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
          padding={0.3}
          theme={{
            text: {
              fill: "black",
              fontSize: 14,
            },
            axis: {
              domain: {
                line: {
                  stroke: "black",
                },
              },
              legend: {
                text: {
                  fill: "black",
                },
              },
              ticks: {
                line: {
                  stroke: "black",
                  strokeWidth: 1,
                },
                text: {
                  fill: "black",
                },
              },
            },
            legends: {
              text: {
                fill: "black",
              },
            },
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: "Product ID",
            legendPosition: "middle",
            legendOffset: 40,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Review Count",
            legendPosition: "middle",
            legendOffset: -40,
          }}
          tooltip={({ indexValue, value }) => (
            <div
              style={{
                background: "white",
                padding: "9px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <strong>Product: {indexValue}</strong>
              <br />
              <span>Reviews: {value}</span>
            </div>
          )}
          enableLabel={true}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        />
      </Box>
    </Box>
  );
};

export default ReviewChart;
