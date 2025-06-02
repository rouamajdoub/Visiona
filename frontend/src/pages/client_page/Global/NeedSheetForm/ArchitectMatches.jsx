// components/ArchitectMatches.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getMatches,
  selectMatchesForNeedsheet,
  selectNeedsheetLoading,
  selectNeedsheetErrors,
} from "../../../../redux/slices/needSheetSlice";
import "./ArchitectMatches.css";

const ArchitectMatches = () => {
  const dispatch = useDispatch();
  const { needsheetId } = useParams();

  // Use the correct selector
  const matchesData = useSelector(selectMatchesForNeedsheet(needsheetId));
  const loading = useSelector(selectNeedsheetLoading);
  const errors = useSelector(selectNeedsheetErrors);

  useEffect(() => {
    console.log("ArchitectMatches - Effect running:", {
      needsheetId,
      matchesData,
      loading: loading.getMatches,
      error: errors.getMatches,
    });

    if (needsheetId && !matchesData && !loading.getMatches) {
      console.log("Dispatching getMatches for needsheetId:", needsheetId);
      dispatch(getMatches(needsheetId));
    }
  }, [dispatch, needsheetId, matchesData, loading.getMatches]);

  // Debug logging
  useEffect(() => {
    console.log("ArchitectMatches - State update:", {
      needsheetId,
      matchesData,
      matchesDataType: typeof matchesData,
      matchesStructure: matchesData ? Object.keys(matchesData) : null,
      loading: loading.getMatches,
      error: errors.getMatches,
    });
  }, [matchesData, loading.getMatches, errors.getMatches, needsheetId]);

  // Handle loading state
  if (loading.getMatches) {
    return (
      <div className="matches-container">
        <div className="loading-message">Loading matches...</div>
      </div>
    );
  }

  // Handle error state
  if (errors.getMatches) {
    return (
      <div className="matches-container">
        <div className="error-message">
          Error loading matches: {errors.getMatches}
          <button
            onClick={() => dispatch(getMatches(needsheetId))}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle no matches data
  if (!matchesData) {
    return (
      <div className="matches-container">
        <div className="no-data-message">
          No match data available.
          <button
            onClick={() => dispatch(getMatches(needsheetId))}
            className="retry-button"
          >
            Load Matches
          </button>
        </div>
      </div>
    );
  }

  // Extract matches array from the data structure
  // Based on your reducer, the structure should be: { matches: [...], needsheetId: "...", ... }
  const matches = matchesData.matches || [];

  console.log("ArchitectMatches - Final render:", {
    matchesArray: matches,
    matchesLength: matches.length,
  });

  // Handle empty matches
  if (!matches || matches.length === 0) {
    return (
      <div className="matches-container">
        <h2>Matching Architects</h2>
        <div className="no-matches-message">
          No matches found for this project.
          <button
            onClick={() => dispatch(getMatches(needsheetId))}
            className="retry-button"
          >
            Refresh Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <h2>Matching Architects</h2>
      <div className="matches-summary">
        Found {matches.length} matching architect
        {matches.length !== 1 ? "s" : ""}
      </div>

      <ul className="matches-list">
        {matches.map((match, index) => {
          // Handle different possible data structures
          const architect = match.architect || match.architectId || match;
          const matchScore = match.score || match.matchScore || 0;
          const matchStatus = match.status || "pending";

          console.log(`Match ${index}:`, {
            match,
            architect,
            matchScore,
            matchStatus,
          });

          return (
            <li
              key={architect._id || architect.id || index}
              className="match-item"
            >
              <div className="architect-info">
                <h3>
                  {architect.name ||
                    architect.firstName + " " + architect.lastName ||
                    "Unknown Architect"}
                </h3>
                <p>
                  Specialty:{" "}
                  {architect.specialty ||
                    architect.specialties?.join(", ") ||
                    "Not specified"}
                </p>
                <p>
                  Score:{" "}
                  {typeof matchScore === "number"
                    ? matchScore.toFixed(2)
                    : matchScore}
                  %
                </p>
                <p>
                  Status:{" "}
                  <span className={`status-${matchStatus}`}>{matchStatus}</span>
                </p>
              </div>

              <div className="match-details">
                <p>
                  Location:{" "}
                  {architect.location || architect.address || "Not specified"}
                </p>
                <p>
                  Experience:{" "}
                  {architect.experience ||
                    architect.yearsOfExperience ||
                    "Not specified"}{" "}
                  years
                </p>
                {architect.portfolio && (
                  <p>
                    Portfolio:{" "}
                    <a
                      href={architect.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Portfolio
                    </a>
                  </p>
                )}
              </div>

              {match.approval && (
                <div className="approval-status">
                  <p>
                    Client Approval:{" "}
                    {match.approval.client ? "Approved" : "Pending"}
                  </p>
                  <p>
                    Architect Approval:{" "}
                    {match.approval.architect ? "Approved" : "Pending"}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ArchitectMatches;
