import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProjects } from "../../../../../redux/slices/ProjectSlice"; // Adjust path if needed
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useEffect } from "react";
import "./Table.css";

// Calculate days remaining until end date
const calculateDaysRemaining = (endDate) => {
  if (!endDate) return "No end date";

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0); // Reset time to start of day

  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} left`;
};

// Style for the days remaining cell
const getDaysRemainingStyle = (daysText) => {
  if (daysText === "Overdue") {
    return {
      background: "#ffadad8f",
      color: "#e50000",
      fontWeight: "bold",
    };
  } else if (daysText === "Due today") {
    return {
      background: "#ffd6a5",
      color: "#e66000",
      fontWeight: "bold",
    };
  } else if (daysText.includes("day") && parseInt(daysText) <= 7) {
    return {
      background: "#ffffbf",
      color: "#a3a300",
      fontWeight: "bold",
    };
  } else {
    return {
      background: "#caffbf",
      color: "#008f00",
      fontWeight: "bold",
    };
  }
};

export default function UpcomingProjectsTable() {
  const dispatch = useDispatch();

  // Get authentication token from Redux state
  const { token, isAuthenticated } = useSelector((state) => state.auth || {});

  // Get projects state from Redux
  const projectsState = useSelector((state) => state.projects || {});
  const { projects = [], isLoading, error } = projectsState;

  // Map the values from projects state to expected names for our component
  const status = isLoading ? "loading" : error ? "failed" : "succeeded";

  useEffect(() => {
    // Only fetch projects if we're authenticated
    if (isAuthenticated && token) {
      dispatch(fetchAllProjects());
    }
  }, [dispatch, isAuthenticated, token]);

  // Get projects with valid end dates, calculate days remaining, and sort
  const getUpcomingProjects = (allProjects) => {
    if (!Array.isArray(allProjects)) {
      console.error("Projects is not an array:", allProjects);
      return [];
    }

    // Filter out projects without end dates
    const projectsWithEndDates = allProjects.filter(
      (project) => project && project.endDate
    );

    // Add days remaining as a property and sort by days remaining
    const processedProjects = projectsWithEndDates
      .map((project) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endDate = new Date(project.endDate);
        endDate.setHours(0, 0, 0, 0);

        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...project,
          daysRemaining: diffDays,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining) // Sort by days remaining (ascending)
      .slice(0, 5); // Take only the first 5

    return processedProjects;
  };

  // Get the upcoming projects if projects are loaded
  const upcomingProjects =
    status === "succeeded" ? getUpcomingProjects(projects) : [];

  // If we're not authenticated, show a message
  if (!isAuthenticated) {
    return (
      <div className="dash-table">
        <h3>Upcoming Deadlines (5 Closest)</h3>
        <p>Please log in to view your upcoming project deadlines.</p>
      </div>
    );
  }

  return (
    <div className="dash-table">
      <h3>Upcoming Deadlines (5 Closest)</h3>

      {status === "loading" && <p>Loading projects...</p>}

      {status === "failed" && (
        <p>Error loading projects. Please try again later.</p>
      )}

      {Array.isArray(upcomingProjects) &&
        upcomingProjects.length === 0 &&
        status === "succeeded" && (
          <p>No upcoming projects with deadlines found.</p>
        )}

      {Array.isArray(upcomingProjects) && upcomingProjects.length > 0 && (
        <TableContainer component={Paper} className="dash-table-container">
          <Table
            sx={{ minWidth: 650 }}
            aria-label="upcoming projects table"
            className="dash-table-main"
          >
            <TableHead>
              <TableRow className="dash-table-header-row">
                <TableCell className="dash-table-header-cell">
                  Project
                </TableCell>
                <TableCell align="left" className="dash-table-header-cell">
                  Category
                </TableCell>
                <TableCell align="left" className="dash-table-header-cell">
                  End Date
                </TableCell>
                <TableCell align="left" className="dash-table-header-cell">
                  Time Remaining
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingProjects.map((project, index) => {
                const daysRemainingText = calculateDaysRemaining(
                  project.endDate
                );
                return (
                  <TableRow
                    key={project._id || index}
                    className="dash-table-row"
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      className="dash-table-cell"
                    >
                      {project.title}
                    </TableCell>
                    <TableCell align="left" className="dash-table-cell">
                      {project.category || "Uncategorized"}
                    </TableCell>
                    <TableCell align="left" className="dash-table-cell">
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell
                      align="left"
                      className="dash-table-cell dash-table-time-cell"
                      style={getDaysRemainingStyle(daysRemainingText)}
                    >
                      {daysRemainingText}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
