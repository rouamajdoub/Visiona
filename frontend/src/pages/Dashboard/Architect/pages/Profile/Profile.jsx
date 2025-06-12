import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArchitectProfile,
  selectArchitectProfile,
  selectArchitectLoading,
  selectArchitectError,
  selectArchitectProfileCompleteness,
} from "../../../../../redux/slices/architectSlice";
import EditProfile from "./ProfileEdit";
import "./ProfileMain.css";

const Profile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectArchitectProfile);
  const loading = useSelector(selectArchitectLoading);
  const error = useSelector(selectArchitectError);
  const completeness = useSelector(selectArchitectProfileCompleteness);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!profile) {
      dispatch(fetchArchitectProfile());
    }
  }, [dispatch, profile]);

  const getBadgeImage = (subscriptionType) => {
    switch (subscriptionType) {
      case "free":
        return "./img/1.png";
      case "vip":
        return "./img/3.png";
      case "premium":
      default:
        return "./img/2.png";
    }
  };

  const getSubscriptionLabel = (subscriptionType) => {
    switch (subscriptionType) {
      case "free":
        return "Free Plan";
      case "premium":
        return "Premium Plan";
      case "vip":
        return "VIP Plan";
      default:
        return "Premium Plan";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatArrayField = (field) => {
    if (!field || !Array.isArray(field)) return "Not specified";

    // Handle array of objects (like certifications with _id, name, description)
    if (field.length > 0 && typeof field[0] === "object" && field[0] !== null) {
      return field
        .map((item) => {
          // If it's an object with name property, use that
          if (item.name) return item.name;
          // If it's an object with title property, use that
          if (item.title) return item.title;
          // If it's an object with description property, use that
          if (item.description) return item.description;
          // Otherwise try to convert to string
          return typeof item === "string" ? item : JSON.stringify(item);
        })
        .join(", ");
    }

    // Handle array of strings
    return field.join(", ");
  };

  // Safe render function for potentially object values
  const safeRender = (value, fallback = "Not specified") => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string" || typeof value === "number") return value;
    if (typeof value === "object") {
      // If it's an object, try to extract meaningful information
      if (value.name) return value.name;
      if (value.title) return value.title;
      if (value.description) return value.description;
      // As last resort, stringify it
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="architect-profile-loading">
        <div className="architect-profile-spinner">
          <div className="architect-profile-spinner-inner"></div>
        </div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="architect-profile-error">
        <div className="architect-profile-error-icon">⚠️</div>
        <h3>Unable to load profile</h3>
        <p>{error.error || "An unexpected error occurred"}</p>
        <button
          className="architect-profile-retry-btn"
          onClick={() => dispatch(fetchArchitectProfile())}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="architect-profile-empty">
        <div className="architect-profile-empty-icon">👤</div>
        <h3>No profile found</h3>
        <p>Please create your profile to get started</p>
      </div>
    );
  }

  return (
    <div className="architect-profile-container">
      {/* Header Section */}
      <div className="architect-profile-header">
        <div className="architect-profile-header-content">
          <div className="architect-profile-avatar-section">
            <div className="architect-profile-avatar">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="architect-profile-avatar-img"
                />
              ) : (
                <div className="architect-profile-avatar-placeholder">
                  {profile.prenom?.charAt(0) || ""}
                  {profile.nomDeFamille?.charAt(0) || ""}
                </div>
              )}
              <div className="architect-profile-badge">
                <img
                  src={getBadgeImage(profile.subscriptionType)}
                  alt={getSubscriptionLabel(profile.subscriptionType)}
                  className="architect-profile-badge-img"
                />
              </div>
            </div>
          </div>

          <div className="architect-profile-info">
            <h1 className="architect-profile-name">
              {safeRender(profile.prenom)} {safeRender(profile.nomDeFamille)}
            </h1>
            <p className="architect-profile-title">
              {safeRender(profile.specialty, "Architect")}
            </p>
            <div className="architect-profile-meta">
              <span className="architect-profile-experience">
                {safeRender(profile.experienceYears, 0)} years experience
              </span>
              <span className="architect-profile-location">
                📍 {safeRender(profile.location?.city)},{" "}
                {safeRender(profile.location?.country)}
              </span>
            </div>
            <div className="architect-profile-subscription">
              <span className="architect-profile-subscription-label">
                {getSubscriptionLabel(profile.subscriptionType)}
              </span>
            </div>
          </div>

          <div className="architect-profile-actions">
            <button
              className="architect-profile-edit-btn"
              onClick={() => setShowEditModal(true)}
            >
              ✏️ Edit Profile
            </button>
            <div className="architect-profile-completeness">
              <div className="architect-profile-completeness-label">
                Profile Completeness
              </div>
              <div className="architect-profile-completeness-bar">
                <div
                  className="architect-profile-completeness-fill"
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <span className="architect-profile-completeness-percent">
                {completeness}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="architect-profile-nav">
        <button
          className={`architect-profile-nav-tab ${
            activeTab === "overview" ? "architect-profile-nav-active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`architect-profile-nav-tab ${
            activeTab === "portfolio" ? "architect-profile-nav-active" : ""
          }`}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio
        </button>
        <button
          className={`architect-profile-nav-tab ${
            activeTab === "details" ? "architect-profile-nav-active" : ""
          }`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
      </div>

      {/* Content Sections */}
      <div className="architect-profile-content">
        {activeTab === "overview" && (
          <div className="architect-profile-overview">
            <div className="architect-profile-card">
              <h3>About</h3>
              <p className="architect-profile-bio">
                {safeRender(profile.bio, "No bio available")}
              </p>
            </div>

            <div className="architect-profile-stats">
              <div className="architect-profile-stat">
                <span className="architect-profile-stat-number">
                  {safeRender(profile.experienceYears, 0)}
                </span>
                <span className="architect-profile-stat-label">
                  Years Experience
                </span>
              </div>
              <div className="architect-profile-stat">
                <span className="architect-profile-stat-number">
                  {profile.portfolio?.length || 0}
                </span>
                <span className="architect-profile-stat-label">Projects</span>
              </div>
              <div className="architect-profile-stat">
                <span className="architect-profile-stat-number">
                  {profile.certifications?.length || 0}
                </span>
                <span className="architect-profile-stat-label">
                  Certifications
                </span>
              </div>
            </div>

            <div className="architect-profile-quick-info">
              <div className="architect-profile-card">
                <h4>Contact Information</h4>
                <div className="architect-profile-contact-item">
                  <span className="architect-profile-contact-label">
                    Email:
                  </span>
                  <span className="architect-profile-contact-value">
                    {safeRender(profile.email)}
                  </span>
                </div>
                <div className="architect-profile-contact-item">
                  <span className="architect-profile-contact-label">
                    Phone:
                  </span>
                  <span className="architect-profile-contact-value">
                    {safeRender(profile.phoneNumber, "Not provided")}
                  </span>
                </div>
                <div className="architect-profile-contact-item">
                  <span className="architect-profile-contact-label">
                    Website:
                  </span>
                  <span className="architect-profile-contact-value">
                    {profile.website ? (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {safeRender(profile.website)}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="architect-profile-portfolio">
            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div className="architect-profile-portfolio-grid">
                {profile.portfolio.map((item, index) => (
                  <div key={index} className="architect-profile-portfolio-item">
                    {item.images && item.images.length > 0 && (
                      <img
                        src={item.images[0]}
                        alt={safeRender(item.title, `Project ${index + 1}`)}
                        className="architect-profile-portfolio-image"
                      />
                    )}
                    <div className="architect-profile-portfolio-content">
                      <h4>{safeRender(item.title, `Project ${index + 1}`)}</h4>
                      <p>
                        {safeRender(
                          item.description,
                          "No description available"
                        )}
                      </p>
                      {item.category && (
                        <span className="architect-profile-portfolio-category">
                          {safeRender(item.category)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="architect-profile-empty-portfolio">
                <div className="architect-profile-empty-icon">🏗️</div>
                <h3>No portfolio items yet</h3>
                <p>Add your projects to showcase your work</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "details" && (
          <div className="architect-profile-details">
            <div className="architect-profile-details-grid">
              <div className="architect-profile-card">
                <h4>Professional Information</h4>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Patent Number:
                  </span>
                  <span className="architect-profile-detail-value">
                    {safeRender(profile.patenteNumber, "Not provided")}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Company:
                  </span>
                  <span className="architect-profile-detail-value">
                    {safeRender(profile.companyName, "Not provided")}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Specializations:
                  </span>
                  <span className="architect-profile-detail-value">
                    {formatArrayField(profile.specialization)}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Services:
                  </span>
                  <span className="architect-profile-detail-value">
                    {formatArrayField(profile.services)}
                  </span>
                </div>
              </div>

              <div className="architect-profile-card">
                <h4>Education</h4>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Degree:
                  </span>
                  <span className="architect-profile-detail-value">
                    {safeRender(profile.education?.degree, "Not provided")}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Institution:
                  </span>
                  <span className="architect-profile-detail-value">
                    {safeRender(profile.education?.institution, "Not provided")}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Graduation Year:
                  </span>
                  <span className="architect-profile-detail-value">
                    {safeRender(
                      profile.education?.graduationYear,
                      "Not provided"
                    )}
                  </span>
                </div>
              </div>

              <div className="architect-profile-card">
                <h4>Social Media</h4>
                {profile.socialMedia &&
                  Object.entries(profile.socialMedia).map(
                    ([platform, url]) =>
                      url && (
                        <div
                          key={platform}
                          className="architect-profile-detail-item"
                        >
                          <span className="architect-profile-detail-label">
                            {platform.charAt(0).toUpperCase() +
                              platform.slice(1)}
                            :
                          </span>
                          <span className="architect-profile-detail-value">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {safeRender(url)}
                            </a>
                          </span>
                        </div>
                      )
                  )}
              </div>

              <div className="architect-profile-card">
                <h4>Additional Information</h4>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Certifications:
                  </span>
                  <span className="architect-profile-detail-value">
                    {formatArrayField(profile.certifications)}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Languages:
                  </span>
                  <span className="architect-profile-detail-value">
                    {formatArrayField(profile.languages)}
                  </span>
                </div>
                <div className="architect-profile-detail-item">
                  <span className="architect-profile-detail-label">
                    Member Since:
                  </span>
                  <span className="architect-profile-detail-value">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfile
          onClose={() => setShowEditModal(false)}
          profile={profile}
        />
      )}
    </div>
  );
};

export default Profile;
