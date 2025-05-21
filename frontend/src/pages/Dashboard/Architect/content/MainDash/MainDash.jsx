import React from "react";
import "./MainDash.css";
import Cards from "../Cards/Cards";
import UpcomingProjectsTable from "../Table/UpcomingProjectsTable"; // Import the new table component

const MainDash = () => {
  return (
    <div className="MainDash">
      <h1>Dashboard</h1>
      <Cards />
      <UpcomingProjectsTable /> {/* Use the new component instead of Table */}
    </div>
  );
};

export default MainDash;
