import React from "react";
import "./MainDash.css";
import Cards from "../Cards/Cards";
import UpcomingProjectsTable from "../Table/UpcomingProjectsTable"; // Import the new table component
import Typography from "@mui/material/Typography";

const MainDash = () => {
  return (
    <div className="MainDash">
      <Typography
        variant="h3"
        sx={{
          color: "#09153e",
          fontWeight: "bold",

          marginBottom: "20px",
        }}
      >
        Dashboard
      </Typography>
      <Cards />
      <UpcomingProjectsTable /> {/* Use the new component instead of Table */}
    </div>
  );
};

export default MainDash;
