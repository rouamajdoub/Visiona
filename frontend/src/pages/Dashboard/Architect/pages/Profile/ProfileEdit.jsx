import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateArchitectProfile,
  updateArchitectServices,
  selectArchitectProfile,
  selectArchitectUpdateLoading,
  selectArchitectUpdateError,
  selectArchitectUpdateSuccess,
  clearUpdateStatus,
  clearUpdateError,
} from "../../../../../redux/slices/architectSlice";
// Fixed imports - use the correct selector names
import {
  fetchCategories, // ✅ Correct - was fetchServiceCategories
  selectAllCategories, // ✅ Correct - was selectServiceCategories
  selectServiceCategoriesStatus, // ✅ Use this for loading state
} from "../../../../../redux/slices/serviceCategoriesSlice";
import "./Profile.css";

const ProfileEdit = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const profile = useSelector(selectArchitectProfile);
  const updateLoading = useSelector(selectArchitectUpdateLoading);
  const updateError = useSelector(selectArchitectUpdateError);
  const updateSuccess = useSelector(selectArchitectUpdateSuccess);

  // Service categories data - fixed selectors
  const serviceCategories = useSelector(selectAllCategories);
  const { loading: serviceCategoriesLoading } = useSelector(
    selectServiceCategoriesStatus
  );

  // Form state - removed services from here since it's managed separately
  const [formData, setFormData] = useState({
    prenom: "",
    nomDeFamille: "",
    email: "",
    phoneNumber: "",
    bio: "",
    experienceYears: "",
    specialty: "",
    patenteNumber: "",
    companyName: "",
    website: "",
    location: {
      country: "",
      region: "",
      city: "",
      coordinates: [],
    },
    education: {
      degree: "",
      institution: "",
      graduationYear: "",
    },
    socialMedia: {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
    specialization: [],
    certifications: [],
    projectTypes: [],
    softwareProficiency: [],
    languages: [],
  });

  // Separate state for services
  const [selectedServices, setSelectedServices] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch service categories on component mount - fixed function name
  useEffect(() => {
    if (isOpen && (!serviceCategories || serviceCategories.length === 0)) {
      dispatch(fetchCategories()); // ✅ Fixed - was fetchServiceCategories
    }
  }, [isOpen, serviceCategories, dispatch]);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        prenom: profile.prenom || "",
        nomDeFamille: profile.nomDeFamille || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        experienceYears: profile.experienceYears || "",
        specialty: profile.specialty || "",
        patenteNumber: profile.patenteNumber || "",
        companyName: profile.companyName || "",
        website: profile.website || "",
        location: {
          country: profile.location?.country || "",
          region: profile.location?.region || "",
          city: profile.location?.city || "",
          coordinates: profile.location?.coordinates || [],
        },
        education: {
          degree: profile.education?.degree || "",
          institution: profile.education?.institution || "",
          graduationYear: profile.education?.graduationYear || "",
        },
        socialMedia: {
          linkedin: profile.socialMedia?.linkedin || "",
          instagram: profile.socialMedia?.instagram || "",
          facebook: profile.socialMedia?.facebook || "",
          twitter: profile.socialMedia?.twitter || "",
        },
        specialization: profile.specialization || [],
        certifications: profile.certifications || [],
        projectTypes: profile.projectTypes || [],
        softwareProficiency: profile.softwareProficiency || [],
        languages: profile.languages || [],
      });

      // Set selected services separately
      if (profile.services) {
        // Extract service IDs if services are objects, otherwise use as-is
        const serviceIds = profile.services.map((service) =>
          typeof service === "object" ? service._id || service.id : service
        );
        setSelectedServices(serviceIds);
      } else {
        setSelectedServices([]);
      }

      if (profile.profilePicture) {
        setPreviewImage(profile.profilePicture);
      }
    }
  }, [profile]);

  // Handle successful update
  useEffect(() => {
    if (updateSuccess) {
      onClose();
      dispatch(clearUpdateStatus());
    }
  }, [updateSuccess, onClose, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayInputChange = (field, value) => {
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  const handleServiceChange = (serviceId) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // First, update the profile data (excluding services)
      const submitData = new FormData();

      // Add all form fields to FormData (services are excluded from formData)
      Object.keys(formData).forEach((key) => {
        if (
          typeof formData[key] === "object" &&
          !Array.isArray(formData[key])
        ) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (Array.isArray(formData[key])) {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Add profile image if selected
      if (profileImage) {
        submitData.append("profilePicture", profileImage);
      }

      // Update profile first
      const profileUpdateResult = await dispatch(
        updateArchitectProfile(submitData)
      );

      // If profile update was successful and services have changed, update services separately
      if (profileUpdateResult.type === "architect/updateProfile/fulfilled") {
        // Check if services have actually changed
        const currentServices = profile.services || [];
        const currentServiceIds = currentServices.map((service) =>
          typeof service === "object" ? service._id || service.id : service
        );

        const servicesChanged =
          selectedServices.length !== currentServiceIds.length ||
          selectedServices.some((id) => !currentServiceIds.includes(id));

        if (servicesChanged && selectedServices.length > 0) {
          await dispatch(updateArchitectServices(selectedServices));
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleClose = () => {
    dispatch(clearUpdateError());
    onClose();
  };

  // Helper function to render service categories
  const renderServiceCategories = () => {
    if (serviceCategoriesLoading) {
      return <div className="pe-loading">Loading services...</div>;
    }

    if (!serviceCategories || serviceCategories.length === 0) {
      return <div className="pe-no-services">No services available</div>;
    }

    return serviceCategories.map((category) => (
      <div key={category._id || category.id} className="pe-service-category">
        <h4 className="pe-category-title">{category.name}</h4>
        {category.subcategories && category.subcategories.length > 0 ? (
          <div className="pe-subcategories">
            {category.subcategories.map((subcategory) => (
              <label
                key={subcategory._id || subcategory.id}
                className="pe-service-checkbox"
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(
                    subcategory._id || subcategory.id
                  )}
                  onChange={() =>
                    handleServiceChange(subcategory._id || subcategory.id)
                  }
                />
                <span className="pe-checkbox-label">{subcategory.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <label className="pe-service-checkbox">
            <input
              type="checkbox"
              checked={selectedServices.includes(category._id || category.id)}
              onChange={() => handleServiceChange(category._id || category.id)}
            />
            <span className="pe-checkbox-label">{category.name}</span>
          </label>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="pe-dialog-overlay" onClick={handleClose}>
      <div className="pe-dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="pe-dialog-header">
          <h2 className="pe-dialog-title">Edit Profile</h2>
          <button className="pe-close-button" onClick={handleClose}>
            <span className="pe-close-icon">×</span>
          </button>
        </div>

        <form className="pe-form" onSubmit={handleSubmit}>
          <div className="pe-form-content">
            {/* Profile Image Section */}
            <div className="pe-section">
              <h3 className="pe-section-title">Profile Picture</h3>
              <div className="pe-image-upload">
                <div className="pe-image-preview">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="pe-preview-img"
                    />
                  ) : (
                    <div className="pe-placeholder-img">
                      <span className="pe-placeholder-text">No Image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="pe-file-input"
                />
                <label htmlFor="profileImage" className="pe-file-label">
                  Choose Image
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="pe-section">
              <h3 className="pe-section-title">Basic Information</h3>
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-label">First Name *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Last Name *</label>
                  <input
                    type="text"
                    name="nomDeFamille"
                    value={formData.nomDeFamille}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="pe-input"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="pe-section">
              <h3 className="pe-section-title">Professional Information</h3>
              <div className="pe-form-group">
                <label className="pe-label">Bio *</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="pe-textarea"
                  rows="4"
                  required
                />
              </div>
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-label">Experience Years *</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    className="pe-input"
                    min="0"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Specialty *</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Patent Number *</label>
                  <input
                    type="text"
                    name="patenteNumber"
                    value={formData.patenteNumber}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="pe-input"
                  />
                </div>
                <div className="pe-form-group pe-full-width">
                  <label className="pe-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="pe-input"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Services Section - Now managed through serviceCategoriesSlice */}
            <div className="pe-section">
              <h3 className="pe-section-title">Services</h3>
              <div className="pe-services-container">
                {renderServiceCategories()}
              </div>
            </div>

            {/* Location */}
            <div className="pe-section">
              <h3 className="pe-section-title">Location</h3>
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-label">Country *</label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Region</label>
                  <input
                    type="text"
                    name="location.region"
                    value={formData.location.region}
                    onChange={handleInputChange}
                    className="pe-input"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">City *</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    className="pe-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="pe-section">
              <h3 className="pe-section-title">Education</h3>
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-label">Degree</label>
                  <input
                    type="text"
                    name="education.degree"
                    value={formData.education.degree}
                    onChange={handleInputChange}
                    className="pe-input"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Institution</label>
                  <input
                    type="text"
                    name="education.institution"
                    value={formData.education.institution}
                    onChange={handleInputChange}
                    className="pe-input"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Graduation Year</label>
                  <input
                    type="number"
                    name="education.graduationYear"
                    value={formData.education.graduationYear}
                    onChange={handleInputChange}
                    className="pe-input"
                    min="1950"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="pe-section">
              <h3 className="pe-section-title">Social Media</h3>
              <div className="pe-form-grid">
                <div className="pe-form-group">
                  <label className="pe-label">LinkedIn</label>
                  <input
                    type="url"
                    name="socialMedia.linkedin"
                    value={formData.socialMedia.linkedin}
                    onChange={handleInputChange}
                    className="pe-input"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Instagram</label>
                  <input
                    type="url"
                    name="socialMedia.instagram"
                    value={formData.socialMedia.instagram}
                    onChange={handleInputChange}
                    className="pe-input"
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Facebook</label>
                  <input
                    type="url"
                    name="socialMedia.facebook"
                    value={formData.socialMedia.facebook}
                    onChange={handleInputChange}
                    className="pe-input"
                    placeholder="https://facebook.com/username"
                  />
                </div>
                <div className="pe-form-group">
                  <label className="pe-label">Twitter</label>
                  <input
                    type="url"
                    name="socialMedia.twitter"
                    value={formData.socialMedia.twitter}
                    onChange={handleInputChange}
                    className="pe-input"
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>

            {/* Skills and Expertise */}
            <div className="pe-section">
              <h3 className="pe-section-title">Skills & Expertise</h3>
              <div className="pe-form-group">
                <label className="pe-label">
                  Specializations (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.specialization.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("specialization", e.target.value)
                  }
                  className="pe-input"
                  placeholder="Residential, Commercial, Sustainable Design"
                />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">
                  Certifications (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.certifications.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("certifications", e.target.value)
                  }
                  className="pe-input"
                  placeholder="LEED AP, NCARB, AIA"
                />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">
                  Project Types (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.projectTypes.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("projectTypes", e.target.value)
                  }
                  className="pe-input"
                  placeholder="Houses, Offices, Schools"
                />
              </div>
            </div>

            {/* Software & Languages */}
            <div className="pe-section">
              <h3 className="pe-section-title">Software & Languages</h3>
              <div className="pe-form-group">
                <label className="pe-label">
                  Software Proficiency (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.softwareProficiency.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange(
                      "softwareProficiency",
                      e.target.value
                    )
                  }
                  className="pe-input"
                  placeholder="AutoCAD, Revit, SketchUp, Photoshop"
                />
              </div>
              <div className="pe-form-group">
                <label className="pe-label">Languages (comma-separated)</label>
                <input
                  type="text"
                  value={formData.languages.join(", ")}
                  onChange={(e) =>
                    handleArrayInputChange("languages", e.target.value)
                  }
                  className="pe-input"
                  placeholder="English, French, Arabic"
                />
              </div>
            </div>

            {updateError && (
              <div className="pe-error-message">
                {updateError.error ||
                  "An error occurred while updating your profile"}
              </div>
            )}
          </div>

          <div className="pe-dialog-footer">
            <button
              type="button"
              onClick={handleClose}
              className="pe-cancel-button"
              disabled={updateLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pe-save-button"
              disabled={updateLoading}
            >
              {updateLoading ? (
                <>
                  <span className="pe-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
