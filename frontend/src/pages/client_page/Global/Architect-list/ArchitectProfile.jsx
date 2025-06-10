import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useArchitect } from "./ArchitectContext";
import {
  fetchArchitectProfile,
  clearCurrentArchitect,
  addArchitectToFavorites,
  removeArchitectFromFavorites,
  selectCurrentArchitect,
  selectLoadingStates,
  selectErrorStates,
} from "../../../../redux/slices/findArchitectSlice";
import "./ArchitectProfile.css";
import ArchitectReviews from "../Review/ArchitectReviews";
// Leaflet Map Component
const ArchitectMap = ({ architect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS and JS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [architect]);

  const initializeMap = () => {
    if (!window.L || !mapRef.current || !architect?.location?.coordinates) {
      console.log("Map initialization failed - missing requirements");
      return;
    }

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Safely extract coordinates with validation
    let lat, lng;
    const coordinates = architect.location.coordinates;

    console.log("Coordinates data:", coordinates, "Type:", typeof coordinates);

    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      // Standard GeoJSON format: [longitude, latitude]
      [lng, lat] = coordinates;
    } else if (coordinates && typeof coordinates === "object") {
      // Handle object format like {lat: 36.8, lng: 10.2} or {latitude: 36.8, longitude: 10.2}
      lat = coordinates.lat || coordinates.latitude;
      lng = coordinates.lng || coordinates.lon || coordinates.longitude;
    } else {
      console.error("Invalid coordinates format:", coordinates);
      return;
    }

    // Validate coordinate values
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      console.error("Invalid coordinate values:", { lat, lng });
      return;
    }

    try {
      // Initialize map
      const map = window.L.map(mapRef.current).setView([lat, lng], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Custom marker icon
      const customIcon = window.L.divIcon({
        html: `
          <div class="arch-profile-map-marker">
            <div class="arch-profile-marker-icon">🏢</div>
          </div>
        `,
        className: "arch-profile-custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Add marker
      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(
        map
      );

      // Add popup
      marker.bindPopup(`
        <div class="arch-profile-map-popup">
          <h4>${architect.name}</h4>
          <p>${architect.location.address || ""}</p>
          <p>${architect.location.city}, ${architect.location.governorate}</p>
        </div>
      `);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  if (!architect?.location?.coordinates) {
    return (
      <div className="arch-profile-map-placeholder">
        <div className="arch-profile-map-placeholder-content">
          <div className="arch-profile-map-placeholder-icon">📍</div>
          <p className="arch-profile-map-placeholder-text">
            Location not available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="arch-profile-map-container">
      <h3 className="arch-profile-section-title">Office Location</h3>
      <div ref={mapRef} className="arch-profile-map"></div>
      <div className="arch-profile-location-info">
        <div className="arch-profile-location-item">
          <span className="arch-profile-location-icon">📍</span>
          <div className="arch-profile-location-details">
            <p className="arch-profile-location-address">
              <strong>Address:</strong>{" "}
              {architect.location.address || "Address not provided"}
            </p>
            <p className="arch-profile-location-city">
              <strong>City:</strong> {architect.location.city},{" "}
              {architect.location.governorate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArchitectProfile = () => {
  const dispatch = useDispatch();
  const { selectedArchitectId, showArchitectList } = useArchitect();
  const architect = useSelector(selectCurrentArchitect);
  const loading = useSelector(selectLoadingStates);
  const error = useSelector(selectErrorStates);

  useEffect(() => {
    if (selectedArchitectId) {
      dispatch(fetchArchitectProfile(selectedArchitectId));
    }

    return () => {
      dispatch(clearCurrentArchitect());
    };
  }, [dispatch, selectedArchitectId]);

  const handleFavoriteToggle = async () => {
    if (!architect) return;

    try {
      if (architect.isFavorite) {
        await dispatch(removeArchitectFromFavorites(architect._id)).unwrap();
      } else {
        await dispatch(
          addArchitectToFavorites({ architectId: architect._id })
        ).unwrap();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleBack = () => {
    showArchitectList();
  };

  const renderRating = () => {
    if (!architect?.rating) return null;

    return (
      <div className="arch-profile-rating">
        <div className="arch-profile-rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`arch-profile-star ${
                star <= Math.floor(architect.rating.average)
                  ? "arch-profile-star-filled"
                  : "arch-profile-star-empty"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <div className="arch-profile-rating-info">
          <span className="arch-profile-rating-score">
            {architect.rating.average.toFixed(1)}
          </span>
          <span className="arch-profile-rating-count">
            ({architect.rating.count} reviews)
          </span>
        </div>
      </div>
    );
  };

  const renderPortfolio = () => {
    if (!architect?.portfolio || architect.portfolio.length === 0) return null;

    return (
      <div className="arch-profile-portfolio">
        <h3 className="arch-profile-section-title">Portfolio</h3>
        <div className="arch-profile-portfolio-grid">
          {architect.portfolio.map((project, index) => (
            <div key={index} className="arch-profile-portfolio-item">
              <div className="arch-profile-portfolio-image-container">
                <img
                  src={project.image || "/default-project.jpg"}
                  alt={project.title}
                  className="arch-profile-portfolio-img"
                />
              </div>
              <div className="arch-profile-portfolio-content">
                <h4 className="arch-profile-portfolio-title">
                  {project.title}
                </h4>
                <p className="arch-profile-portfolio-description">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviews = () => {
    if (!architect?.reviews || architect.reviews.length === 0) return null;

    return (
      <div className="arch-profile-reviews">
        <h3 className="arch-profile-section-title">Client Reviews</h3>
        <div className="arch-profile-reviews-list">
          {architect.reviews.slice(0, 3).map((review, index) => (
            <div key={index} className="arch-profile-review-item">
              <div className="arch-profile-review-header">
                <div className="arch-profile-review-author">
                  <img
                    src={review.client?.profilePicture || "/default-avatar.png"}
                    alt={review.client?.name}
                    className="arch-profile-review-avatar"
                  />
                  <div className="arch-profile-review-info">
                    <h4 className="arch-profile-review-name">
                      {review.client?.name}
                    </h4>
                    <div className="arch-profile-review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`arch-profile-review-star ${
                            star <= review.rating
                              ? "arch-profile-star-filled"
                              : "arch-profile-star-empty"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="arch-profile-review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="arch-profile-review-text">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading.profile) {
    return (
      <div className="arch-profile-loading">
        <div className="arch-profile-spinner"></div>
        <p className="arch-profile-loading-text">
          Loading architect profile...
        </p>
      </div>
    );
  }

  if (error.profile) {
    return (
      <div className="arch-profile-error">
        <div className="arch-profile-error-icon">⚠️</div>
        <p className="arch-profile-error-text">{error.profile}</p>
        <button className="arch-profile-back-btn" onClick={handleBack}>
          Back to List
        </button>
      </div>
    );
  }

  if (!architect) {
    return (
      <div className="arch-profile-not-found">
        <div className="arch-profile-not-found-icon">🔍</div>
        <p className="arch-profile-not-found-text">Architect not found</p>
        <button className="arch-profile-back-btn" onClick={handleBack}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="arch-profile-container">
      <div className="arch-profile-background-gradient"></div>

      {/* Header */}
      <div className="arch-profile-header">
        <button className="arch-profile-back-btn" onClick={handleBack}>
          <span className="arch-profile-back-icon">←</span>
          Back to List
        </button>
        <button
          className={`arch-profile-favorite-btn ${
            architect.isFavorite ? "arch-profile-favorite-active" : ""
          }`}
          onClick={handleFavoriteToggle}
          disabled={loading.addingFavorite || loading.removingFavorite}
        >
          <span className="arch-profile-favorite-icon">
            {architect.isFavorite ? "♥" : "♡"}
          </span>
          {architect.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </button>
      </div>

      {/* Profile Section */}
      <div className="arch-profile-main">
        <div className="arch-profile-info">
          <div className="arch-profile-image-section">
            <div className="arch-profile-image-container">
              <img
                src={architect.profilePicture || "/default-avatar.png"}
                alt={architect.name}
                className="arch-profile-image"
              />
              <div className="arch-profile-status">
                <span
                  className={`arch-profile-status-badge ${
                    architect.isOnline
                      ? "arch-profile-online"
                      : "arch-profile-offline"
                  }`}
                >
                  <span className="arch-profile-status-dot"></span>
                  {architect.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="arch-profile-details">
            <h1 className="arch-profile-name">{architect.name}</h1>
            <p className="arch-profile-specialization">
              {architect.specialization}
            </p>

            {renderRating()}

            <div className="arch-profile-basic-info">
              <div className="arch-profile-info-item">
                <span className="arch-profile-info-icon">💼</span>
                <span className="arch-profile-info-label">Experience:</span>
                <span className="arch-profile-info-value">
                  {architect.experienceYears} years
                </span>
              </div>
              <div className="arch-profile-info-item">
                <span className="arch-profile-info-icon">📍</span>
                <span className="arch-profile-info-label">Location:</span>
                <span className="arch-profile-info-value">
                  {architect.location?.city}, {architect.location?.governorate}
                </span>
              </div>
              <div className="arch-profile-info-item">
                <span className="arch-profile-info-icon">📅</span>
                <span className="arch-profile-info-label">Joined:</span>
                <span className="arch-profile-info-value">
                  {new Date(architect.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="arch-profile-contact">
              <h3 className="arch-profile-contact-title">
                Contact Information
              </h3>
              <div className="arch-profile-contact-info">
                <div className="arch-profile-contact-item">
                  <span className="arch-profile-contact-icon">✉️</span>
                  <span className="arch-profile-contact-label">Email:</span>
                  <a
                    href={`mailto:${architect.email}`}
                    className="arch-profile-contact-link"
                  >
                    {architect.email}
                  </a>
                </div>
                {architect.phone && (
                  <div className="arch-profile-contact-item">
                    <span className="arch-profile-contact-icon">📞</span>
                    <span className="arch-profile-contact-label">Phone:</span>
                    <a
                      href={`tel:${architect.phone}`}
                      className="arch-profile-contact-link"
                    >
                      {architect.phone}
                    </a>
                  </div>
                )}
                {architect.website && (
                  <div className="arch-profile-contact-item">
                    <span className="arch-profile-contact-icon">🌐</span>
                    <span className="arch-profile-contact-label">Website:</span>
                    <a
                      href={architect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="arch-profile-contact-link"
                    >
                      {architect.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {architect.about && (
          <div className="arch-profile-about">
            <h3 className="arch-profile-section-title">About</h3>
            <p className="arch-profile-about-text">{architect.about}</p>
          </div>
        )}

        {/* Services Section */}
        {architect.services && architect.services.length > 0 && (
          <div className="arch-profile-services">
            <h3 className="arch-profile-section-title">Services</h3>
            <div className="arch-profile-services-grid">
              {architect.services.map((service, index) => (
                <div key={index} className="arch-profile-service-item">
                  <span className="arch-profile-service-icon">🔧</span>
                  <span className="arch-profile-service-text">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages Section */}
        {architect.languages && architect.languages.length > 0 && (
          <div className="arch-profile-languages">
            <h3 className="arch-profile-section-title">Languages</h3>
            <div className="arch-profile-languages-list">
              {architect.languages.map((language, index) => (
                <span key={index} className="arch-profile-language-item">
                  <span className="arch-profile-language-icon">🗣️</span>
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        {renderPortfolio()}

        {/* Reviews Section */}
        {renderReviews()}

        {/* Map Section */}
        <ArchitectMap architect={architect} />
      </div>
    </div>
  );
};

export default ArchitectProfile;
