import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchArchitectProfile } from "../../../../../redux/slices/architectSlice";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash,
  Star,
  Building,
  Award,
  Globe,
  Phone,
  Mail,
  Briefcase,
  FileText,
  EyeIcon,
  Plus,
  MapPin,
} from "lucide-react";
import Banner from "../../img/Beige_Modern_Elegant_Banner.png";
import "./ProfileMain.css";
import EditProfile from "./ProfileEdit";

// Configure the base URL for API requests and image paths
const API_BASE_URL = "http://localhost:5000"; // Update this to match your backend URL

// Helper function to format image URLs
const formatImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If the path already includes the full URL, return it as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${imagePath}`;
};

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.architect);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchArchitectProfile());
  }, [dispatch]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  // Open portfolio modal
  const handlePortfolioItemClick = (item) => {
    setSelectedPortfolioItem(item);
    setShowPortfolioModal(true);
  };

  // Close portfolio modal
  const closePortfolioModal = () => {
    setShowPortfolioModal(false);
    setSelectedPortfolioItem(null);
  };

  if (loading) return <p className="loading">Loading profile data...</p>;
  if (error) {
    return (
      <p className="error">Error: {error.message || JSON.stringify(error)}</p>
    );
  }
  if (!profile) return <p className="no-data">No profile data found.</p>;
  if (isEditing) {
    return (
      <EditProfile profile={profile} onCancel={() => setIsEditing(false)} />
    );
  }

  // Helper function to check if a section has data
  const hasData = (obj) => {
    if (!obj) return false;
    return Object.values(obj).some(
      (value) => value !== null && value !== undefined && value !== ""
    );
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="p-header-container">
          {/* Banner Image */}
          <div className="banner">
            <img src={Banner} alt="Banner" className="banner-image" />
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-image-container">
              <img
                src={
                  formatImageUrl(profile.profilePicture) ||
                  "/default-avatar.png"
                }
                alt={`${profile.prenom || "User"}'s Profile`}
                className="profile-image"
              />
            </div>
            <div className="profile-info">
              <h2>
                {profile.prenom} {profile.nomDeFamille}
              </h2>
              <p className="profile-title">
                {profile.specialty || "Architect"}
              </p>
              <div className="profile-contact">
                {profile.email && (
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
                {profile.location &&
                  (profile.location.city || profile.location.country) && (
                    <div className="contact-item">
                      <MapPin size={16} />
                      <span>
                        {[
                          profile.location.city,
                          profile.location.region,
                          profile.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
              </div>
            </div>
            <div className="profile-actions-top">
              <button className="btn btn-blue" onClick={handleEditProfile}>
                <Edit size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content - Main Scrollable Area */}
        <div className="profile-content">
          {/* Overview Section */}
          <div className="section-container">
            <h3 className="section-title">
              <Briefcase size={18} /> Professional Overview
            </h3>
            <div className="profile-grid">
              {/* Bio */}
              {profile.bio && (
                <div className="info-card bio-card">
                  <h4>About</h4>
                  <p>{profile.bio}</p>
                </div>
              )}

              {/* Company & Experience */}
              <div className="info-card">
                <h4>Professional Details</h4>
                {profile.companyName && (
                  <div className="detail-item">
                    <Building size={16} />
                    <div>
                      <strong>Company:</strong> {profile.companyName}
                      {profile.companyLogo && (
                        <img
                          src={formatImageUrl(profile.companyLogo)}
                          alt="Company Logo"
                          className="company-logo-small"
                        />
                      )}
                    </div>
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="detail-item">
                    <Briefcase size={16} />
                    <div>
                      <strong>Experience:</strong> {profile.experienceYears}{" "}
                      years
                    </div>
                  </div>
                )}
                {profile.specialty && (
                  <div className="detail-item">
                    <Award size={16} />
                    <div>
                      <strong>Specialty:</strong> {profile.specialty}
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="detail-item">
                    <Globe size={16} />
                    <div>
                      <strong>Website:</strong>{" "}
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
                {profile.isVerified !== undefined && (
                  <div className="detail-item">
                    <Star size={16} />
                    <div>
                      <strong>Verified:</strong>{" "}
                      {profile.isVerified ? "✅ Yes" : "❌ No"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skip to Portfolio Section for brevity */}
          {/* Portfolio Section */}
          <div className="section-container">
            <h3 className="section-title">
              <FileText size={18} /> Portfolio
            </h3>
            {profile.portfolio && profile.portfolio.length > 0 ? (
              <div className="portfolio-container">
                <div className="portfolio-grid">
                  {profile.portfolio.map((item, index) => {
                    // Handle both string URLs and object structures
                    const imageUrl =
                      typeof item === "string"
                        ? formatImageUrl(item)
                        : formatImageUrl(item.imageUrl);

                    const title =
                      typeof item === "string"
                        ? `Project ${index + 1}`
                        : item.title || `Project ${index + 1}`;

                    return (
                      <div
                        key={index}
                        className="portfolio-item"
                        onClick={() => handlePortfolioItemClick(item)}
                      >
                        <img
                          src={imageUrl}
                          alt={title}
                          className="portfolio-image"
                          onError={(e) => {
                            console.error(`Failed to load image: ${imageUrl}`);
                            e.target.src = "/placeholder-image.png"; // Fallback image
                          }}
                        />
                        <div className="portfolio-overlay">
                          <div className="portfolio-overlay-content">
                            <h4>{title}</h4>
                            <div className="view-project">
                              <EyeIcon size={16} />
                              <span>View Project</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="portfolio-actions">
                  <button className="btn btn-blue" onClick={handleEditProfile}>
                    <Plus size={16} />{" "}
                    {profile.portfolio.length === 0
                      ? "Add Projects"
                      : "Add More Projects"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-portfolio-container">
                <FileText size={48} className="empty-icon" />
                <p>Your portfolio is empty</p>
                <button className="btn btn-blue" onClick={handleEditProfile}>
                  <Plus size={16} /> Add Portfolio Projects
                </button>
              </div>
            )}
          </div>

          {/* Other sections remain the same with image URLs updated */}

          {/* Social Media Links and other sections would go here... */}

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn btn-outline" onClick={handleEditProfile}>
              <Edit size={16} /> Edit Profile
            </button>
            <button className="btn btn-red">
              <Trash size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Item Modal */}
      {showPortfolioModal && selectedPortfolioItem && (
        <div className="modal-overlay" onClick={closePortfolioModal}>
          <div
            className="modal-content portfolio-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" onClick={closePortfolioModal}>
              ×
            </button>
            <div className="portfolio-modal-content">
              <div className="portfolio-modal-image">
                <img
                  src={
                    typeof selectedPortfolioItem === "string"
                      ? formatImageUrl(selectedPortfolioItem)
                      : formatImageUrl(
                          selectedPortfolioItem.imageUrl ||
                            selectedPortfolioItem
                        )
                  }
                  alt={
                    typeof selectedPortfolioItem === "string"
                      ? "Portfolio project"
                      : selectedPortfolioItem.title || "Portfolio project"
                  }
                  onError={(e) => {
                    console.error(`Failed to load modal image`);
                    e.target.src = "/placeholder-image.png"; // Fallback image
                  }}
                />
              </div>
              <div className="portfolio-modal-details">
                <h3>
                  {typeof selectedPortfolioItem === "string"
                    ? "Project Details"
                    : selectedPortfolioItem.title || "Project Details"}
                </h3>
                {typeof selectedPortfolioItem !== "string" &&
                  selectedPortfolioItem.description && (
                    <p className="portfolio-description">
                      {selectedPortfolioItem.description}
                    </p>
                  )}
                {typeof selectedPortfolioItem !== "string" &&
                  selectedPortfolioItem.projectType && (
                    <div className="portfolio-detail">
                      <strong>Type:</strong> {selectedPortfolioItem.projectType}
                    </div>
                  )}
                {typeof selectedPortfolioItem !== "string" &&
                  selectedPortfolioItem.year && (
                    <div className="portfolio-detail">
                      <strong>Year:</strong> {selectedPortfolioItem.year}
                    </div>
                  )}
                {typeof selectedPortfolioItem !== "string" &&
                  selectedPortfolioItem.location && (
                    <div className="portfolio-detail">
                      <strong>Location:</strong>{" "}
                      {selectedPortfolioItem.location}
                    </div>
                  )}
                {typeof selectedPortfolioItem !== "string" &&
                  selectedPortfolioItem.client && (
                    <div className="portfolio-detail">
                      <strong>Client:</strong> {selectedPortfolioItem.client}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
