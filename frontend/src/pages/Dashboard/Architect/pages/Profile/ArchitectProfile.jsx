import React from "react";
import "./ArchitectProfile.css";

const ArchitectProfile = ({ profile, isOwnProfile = false }) => {
  if (!profile) {
    return (
      <div className="architect-profile-loading">
        <div className="architect-profile-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  const getSubscriptionBadge = (subscriptionType) => {
    const badges = {
      free: "/img/free-badge.png",
      vip: "/img/vip-badge.png",
      premium: "/img/premium-badge.png",
    };
    return badges[subscriptionType?.toLowerCase()] || badges.free;
  };

  const getSubscriptionLabel = (subscriptionType) => {
    const labels = {
      free: "Gratuit",
      vip: "VIP",
      premium: "Premium",
    };
    return labels[subscriptionType?.toLowerCase()] || "Gratuit";
  };

  return (
    <div className="architect-profile-container">
      {/* Header Section */}
      <div className="architect-profile-header">
        <div className="architect-profile-cover">
          <div className="architect-profile-header-content">
            <div className="architect-profile-avatar-section">
              <div className="architect-profile-avatar">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="architect-profile-avatar-img"
                  />
                ) : (
                  <div className="architect-profile-avatar-placeholder">
                    {profile.firstName?.[0]}
                    {profile.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="architect-profile-subscription-badge">
                <img
                  src={getSubscriptionBadge(profile.subscriptionType)}
                  alt={getSubscriptionLabel(profile.subscriptionType)}
                  className="architect-profile-badge-img"
                />
              </div>
            </div>

            <div className="architect-profile-info">
              <h1 className="architect-profile-name">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="architect-profile-title">
                {profile.title || "Architecte"}
              </p>
              <div className="architect-profile-location">
                <svg
                  className="architect-profile-location-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{profile.address || "Localisation non spécifiée"}</span>
              </div>
              {profile.phoneNumber && (
                <div className="architect-profile-contact">
                  <svg
                    className="architect-profile-contact-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="architect-profile-content">
        {/* About Section */}
        {profile.bio && (
          <div className="architect-profile-section">
            <h2 className="architect-profile-section-title">À propos</h2>
            <p className="architect-profile-bio">{profile.bio}</p>
          </div>
        )}

        {/* Company Info (for Premium/VIP) */}
        {profile.subscriptionType !== "free" && (
          <div className="architect-profile-section">
            <h2 className="architect-profile-section-title">
              {profile.subscriptionType === "premium"
                ? "Entreprise"
                : "Informations professionnelles"}
            </h2>
            <div className="architect-profile-company-info">
              {profile.companyLogo && (
                <div className="architect-profile-company-logo">
                  <img
                    src={profile.companyLogo}
                    alt="Logo de l'entreprise"
                    className="architect-profile-company-logo-img"
                  />
                </div>
              )}
              <div className="architect-profile-company-details">
                {profile.companyName && (
                  <h3 className="architect-profile-company-name">
                    {profile.companyName}
                  </h3>
                )}
                {profile.experience && (
                  <p className="architect-profile-experience">
                    <strong>Expérience:</strong> {profile.experience} ans
                  </p>
                )}
                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="architect-profile-specialties">
                    <strong>Spécialités:</strong>
                    <div className="architect-profile-specialties-list">
                      {profile.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="architect-profile-specialty-tag"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services */}
        {profile.services && profile.services.length > 0 && (
          <div className="architect-profile-section">
            <h2 className="architect-profile-section-title">Services</h2>
            <div className="architect-profile-services-grid">
              {profile.services.map((service, index) => (
                <div key={index} className="architect-profile-service-card">
                  <h3 className="architect-profile-service-name">
                    {service.name}
                  </h3>
                  <p className="architect-profile-service-description">
                    {service.description}
                  </p>
                  {service.price && (
                    <div className="architect-profile-service-price">
                      À partir de <strong>{service.price}€</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <div className="architect-profile-section">
            <h2 className="architect-profile-section-title">Portfolio</h2>
            <div className="architect-profile-portfolio-grid">
              {profile.portfolio.map((image, index) => (
                <div key={index} className="architect-profile-portfolio-item">
                  <img
                    src={image}
                    alt={`Projet ${index + 1}`}
                    className="architect-profile-portfolio-img"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Limits Info (for own profile) */}
        {isOwnProfile && (
          <div className="architect-profile-section architect-profile-limits-section">
            <h2 className="architect-profile-section-title">
              Limites d'abonnement
            </h2>
            <div className="architect-profile-limits-info">
              <div className="architect-profile-limit-item">
                <span className="architect-profile-limit-label">
                  Type d'abonnement:
                </span>
                <span className="architect-profile-limit-value">
                  {getSubscriptionLabel(profile.subscriptionType)}
                </span>
              </div>
              <div className="architect-profile-limit-item">
                <span className="architect-profile-limit-label">
                  Projets portfolio:
                </span>
                <span className="architect-profile-limit-value">
                  {profile.portfolio?.length || 0} /{" "}
                  {profile.subscriptionType === "free" ? 1 : "Illimité"}
                </span>
              </div>
              {profile.subscriptionType === "free" && (
                <div className="architect-profile-upgrade-notice">
                  <p>
                    Mettez à niveau votre abonnement pour plus de
                    fonctionnalités!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchitectProfile;
