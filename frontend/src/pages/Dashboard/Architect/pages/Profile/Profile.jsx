import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchArchitectProfile } from "../../../../../redux/slices/architectSlice";
import { useNavigate } from "react-router-dom";
import {
  Edit,
  Trash,
  CreditCard,
  File,
  Star,
  Building,
  Award,
  Code,
  Globe,
  Phone,
  Mail,
  Briefcase,
  FileText,
  ChevronRight,
  EyeIcon,
  Plus,
} from "lucide-react";
import Banner from "../../img/Beige_Modern_Elegant_Banner.png";
import "./ProfileMain.css";
import EditProfile from "./ProfileEdit";
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
              src={profile.profilePicture || "/default-avatar.png"}
              alt={`${profile.prenom || "User"}'s Profile`}
              className="profile-image"
            />
          </div>
          <div className="profile-info">
            <h2>
              {profile.prenom} {profile.nomDeFamille}
            </h2>
            <p className="profile-title">{profile.specialty || "Architect"}</p>
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
                    <Globe size={16} />
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

      {/* Overview Section */}
      <div className="profile-content">
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
                        src={profile.companyLogo}
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
                    <strong>Experience:</strong> {profile.experienceYears} years
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

        {/* Specializations & Skills */}
        <div className="section-container">
          <h3 className="section-title">
            <Code size={18} /> Skills & Expertise
          </h3>
          <div className="profile-grid">
            {/* Specializations */}
            {profile.specializations && profile.specializations.length > 0 && (
              <div className="info-card">
                <h4>Areas of Specialization</h4>
                <div className="tags-container">
                  {profile.specializations.map((spec, index) => (
                    <span key={index} className="tag">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Types */}
            {profile.projectTypes && profile.projectTypes.length > 0 && (
              <div className="info-card">
                <h4>Project Types</h4>
                <div className="tags-container">
                  {profile.projectTypes.map((type, index) => (
                    <span key={index} className="tag">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {profile.services && profile.services.length > 0 && (
              <div className="info-card">
                <h4>Services Offered</h4>
                <div className="tags-container">
                  {profile.services.map((service, index) => (
                    <span key={index} className="tag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Software Skills */}
            {profile.softwareProficiency &&
              profile.softwareProficiency.length > 0 && (
                <div className="info-card">
                  <h4>Software Proficiency</h4>
                  <div className="skills-container">
                    {profile.softwareProficiency.map((skill, index) => (
                      <div key={index} className="skill-item">
                        <span className="skill-name">{skill.name}</span>
                        <div className="skill-level">
                          <div
                            className={`skill-level-bar ${skill.level.toLowerCase()}`}
                            style={{
                              width:
                                skill.level === "Beginner"
                                  ? "25%"
                                  : skill.level === "Intermediate"
                                  ? "50%"
                                  : skill.level === "Advanced"
                                  ? "75%"
                                  : "100%",
                            }}
                          ></div>
                        </div>
                        <span className="skill-level-text">{skill.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="info-card">
                <h4>Languages</h4>
                <div className="languages-container">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="language-item">
                      <span className="language-name">{lang.language}</span>
                      <span className="language-proficiency">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education & Certification */}
        <div className="section-container">
          <h3 className="section-title">
            <Award size={18} /> Education & Credentials
          </h3>
          <div className="profile-grid">
            {/* Education */}
            {hasData(profile.education) && (
              <div className="info-card">
                <h4>Education</h4>
                <div className="education-item">
                  {profile.education.degree && (
                    <p className="education-degree">
                      {profile.education.degree}
                    </p>
                  )}
                  {profile.education.institution && (
                    <p className="education-institution">
                      {profile.education.institution}
                    </p>
                  )}
                  {profile.education.graduationYear && (
                    <p className="education-year">
                      {profile.education.graduationYear}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {profile.certifications && profile.certifications.length > 0 && (
              <div className="info-card">
                <h4>Certifications & Licenses</h4>
                <div className="certifications-container">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="certification-item">
                      <Award size={16} className="cert-icon" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Work History */}
        {profile.companyHistory && profile.companyHistory.length > 0 && (
          <div className="section-container">
            <h3 className="section-title">
              <Building size={18} /> Work History
            </h3>
            <div className="info-card">
              <div className="company-history-container">
                {profile.companyHistory.map((company, index) => (
                  <div key={index} className="company-history-item">
                    <div className="company-timeline">
                      <div className="timeline-dot"></div>
                      <div className="timeline-line"></div>
                    </div>
                    <div className="company-details">
                      <h4 className="company-name">{company.name}</h4>
                      <p className="company-position">{company.position}</p>
                      <p className="company-period">
                        {new Date(company.startDate).toLocaleDateString()} -
                        {company.isCurrentPosition
                          ? " Present"
                          : company.endDate
                          ? ` ${new Date(company.endDate).toLocaleDateString()}`
                          : ""}
                      </p>
                      {company.description && (
                        <p className="company-description">
                          {company.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Section */}
        <div className="section-container">
          <h3 className="section-title">
            <FileText size={18} /> Portfolio
          </h3>
          {profile.portfolio && profile.portfolio.length > 0 ? (
            <div className="portfolio-container">
              <div className="portfolio-grid">
                {profile.portfolio.map((item, index) => (
                  <div
                    key={index}
                    className="portfolio-item"
                    onClick={() => handlePortfolioItemClick(item)}
                  >
                    <img
                      src={item.imageUrl || item}
                      alt={item.title || `Project ${index + 1}`}
                      className="portfolio-image"
                    />
                    <div className="portfolio-overlay">
                      <div className="portfolio-overlay-content">
                        <h4>{item.title || `Project ${index + 1}`}</h4>
                        <div className="view-project">
                          <EyeIcon size={16} />
                          <span>View Project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {profile.portfolio.length < 3 && (
                <div className="portfolio-actions">
                  <button className="btn btn-blue" onClick={handleEditProfile}>
                    <Plus size={16} /> Add More Projects
                  </button>
                </div>
              )}
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

        {/* Social Media Links */}
        {hasData(profile.socialMedia) && (
          <div className="section-container">
            <h3 className="section-title">
              <Globe size={18} /> Connect
            </h3>
            <div className="social-links-container">
              {profile.socialMedia.linkedin && (
                <a
                  href={profile.socialMedia.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link linkedin"
                >
                  LinkedIn
                  <ChevronRight size={16} />
                </a>
              )}
              {profile.socialMedia.instagram && (
                <a
                  href={profile.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                >
                  Instagram
                  <ChevronRight size={16} />
                </a>
              )}
              {profile.socialMedia.facebook && (
                <a
                  href={profile.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link facebook"
                >
                  Facebook
                  <ChevronRight size={16} />
                </a>
              )}
              {profile.socialMedia.twitter && (
                <a
                  href={profile.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link twitter"
                >
                  Twitter
                  <ChevronRight size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Subscription Info */}
        {profile.subscription && (
          <div className="section-container">
            <h3 className="section-title">
              <CreditCard size={18} /> Subscription
            </h3>
            <div className="info-card subscription-card">
              <div className="subscription-details">
                <div className="subscription-info">
                  <h4>{profile.subscription.plan || "Free Plan"}</h4>
                  {profile.subscription.expiryDate && (
                    <p>
                      <strong>Expires on:</strong>{" "}
                      {new Date(
                        profile.subscription.expiryDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button className="btn btn-blue">
                  <CreditCard size={16} /> Manage Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        {profile.stats && (
          <div className="section-container">
            <h3 className="section-title">
              <File size={18} /> Activity Summary
            </h3>
            <div className="stats-card">
              <div className="stats-container">
                <div className="stat-item">
                  <File size={24} className="icon-blue" />
                  <div className="stat-content">
                    <p className="stat-value">{profile.stats.projects || 0}</p>
                    <p className="stat-label">Projects</p>
                  </div>
                </div>
                <div className="stat-item">
                  <Star size={24} className="icon-yellow" />
                  <div className="stat-content">
                    <p className="stat-value">{profile.stats.reviews || 0}</p>
                    <p className="stat-label">Reviews</p>
                  </div>
                </div>
                <div className="stat-item">
                  <CreditCard size={24} className="icon-green" />
                  <div className="stat-content">
                    <p className="stat-value">${profile.stats.earnings || 0}</p>
                    <p className="stat-label">Earnings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="profile-actions">
          <button className="btn btn-outline" onClick={handleEditProfile}>
            <Edit size={16} /> Edit Profile
          </button>
          <button className="btn btn-red">
            <Trash size={16} /> Delete Account
          </button>
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
                      selectedPortfolioItem.imageUrl || selectedPortfolioItem
                    }
                    alt={selectedPortfolioItem.title || "Portfolio project"}
                  />
                </div>
                <div className="portfolio-modal-details">
                  <h3>{selectedPortfolioItem.title || "Project Details"}</h3>
                  {selectedPortfolioItem.description && (
                    <p className="portfolio-description">
                      {selectedPortfolioItem.description}
                    </p>
                  )}
                  {selectedPortfolioItem.projectType && (
                    <div className="portfolio-detail">
                      <strong>Type:</strong> {selectedPortfolioItem.projectType}
                    </div>
                  )}
                  {selectedPortfolioItem.year && (
                    <div className="portfolio-detail">
                      <strong>Year:</strong> {selectedPortfolioItem.year}
                    </div>
                  )}
                  {selectedPortfolioItem.location && (
                    <div className="portfolio-detail">
                      <strong>Location:</strong>{" "}
                      {selectedPortfolioItem.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
