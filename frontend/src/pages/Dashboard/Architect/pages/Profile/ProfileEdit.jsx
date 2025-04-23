import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchArchitectProfile,
  updateArchitectProfile,
  clearUpdateStatus,
} from "../../../../../redux/slices/architectSlice";
import "./Profile.css";

import {
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Camera,
  Building,
  Globe,
  Mail,
  Briefcase,
  Award,
  Code,
  FileText,
} from "lucide-react";

const ProfileEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error, updateLoading, updateSuccess, updateError } =
    useSelector((state) => state.architect);

  // Form state
  const [formData, setFormData] = useState({
    prenom: "",
    nomDeFamille: "",
    email: "",
    phoneNumber: "",
    bio: "",
    companyName: "",
    experienceYears: "",
    specialty: "",
    website: "",
    certification: "",
    education: {
      degree: "",
      institution: "",
      graduationYear: "",
    },
    location: {
      country: "",
      region: "",
      city: "",
    },
    socialMedia: {
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
  });

  // File upload states
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [profilePreview, setProfilePreview] = useState("");
  const [companyLogoPreview, setCompanyLogoPreview] = useState("");

  // Arrays for multi-select inputs
  const [specializations, setSpecializations] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [projectTypes, setProjectTypes] = useState([]);
  const [newProjectType, setNewProjectType] = useState("");
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");

  // Software proficiency
  const [softwareSkills, setSoftwareSkills] = useState([]);
  const [newSoftware, setNewSoftware] = useState({
    name: "",
    level: "Intermediate",
  });

  // Languages
  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({
    language: "",
    proficiency: "Intermediate",
  });

  // Portfolio display and management
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState([]);
  const [showDeletePortfolioModal, setShowDeletePortfolioModal] =
    useState(false);
  const [portfolioItemToDelete, setPortfolioItemToDelete] = useState(null);

  // Company history
  const [companyHistory, setCompanyHistory] = useState([]);
  const [newCompany, setNewCompany] = useState({
    name: "",
    position: "",
    startDate: "",
    endDate: "",
    isCurrentPosition: false,
    description: "",
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (!profile) {
      dispatch(fetchArchitectProfile());
    } else {
      // Populate form with existing data
      setFormData({
        prenom: profile.prenom || "",
        nomDeFamille: profile.nomDeFamille || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        companyName: profile.companyName || "",
        experienceYears: profile.experienceYears || "",
        specialty: profile.specialty || "",
        website: profile.website || "",
        certification: profile.certification || "",
        education: profile.education || {
          degree: "",
          institution: "",
          graduationYear: "",
        },
        location: profile.location || {
          country: "",
          region: "",
          city: "",
        },
        socialMedia: profile.socialMedia || {
          linkedin: "",
          instagram: "",
          facebook: "",
          twitter: "",
        },
      });

      // Set profile picture preview if exists
      if (profile.profilePicture) {
        setProfilePreview(profile.profilePicture);
      }

      // Set company logo preview if exists
      if (profile.companyLogo) {
        setCompanyLogoPreview(profile.companyLogo);
      }

      // Set portfolio items if exist
      if (profile.portfolio && profile.portfolio.length > 0) {
        setPortfolioItems(profile.portfolio);
      }

      // Set arrays
      setSpecializations(profile.specializations || []);
      setCertifications(profile.certifications || []);
      setProjectTypes(profile.projectTypes || []);
      setServices(profile.services || []);
      setSoftwareSkills(profile.softwareProficiency || []);
      setLanguages(profile.languages || []);
      setCompanyHistory(profile.companyHistory || []);
    }
  }, [profile, dispatch]);

  // Reset update status when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearUpdateStatus());
    };
  }, [dispatch]);

  // Navigate away if update was successful
  useEffect(() => {
    if (updateSuccess) {
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [updateSuccess, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle file inputs
  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (name === "profilePicture") {
      if (files[0]) {
        setProfilePictureFile(files[0]);
        setProfilePreview(URL.createObjectURL(files[0]));
      }
    } else if (name === "companyLogo") {
      if (files[0]) {
        setCompanyLogoFile(files[0]);
        setCompanyLogoPreview(URL.createObjectURL(files[0]));
      }
    } else if (name === "portfolio") {
      const newFiles = Array.from(files);
      setPortfolioFiles([...portfolioFiles, ...newFiles]);

      // Create previews for new files
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPortfolioPreviews([...portfolioPreviews, ...newPreviews]);
    }
  };

  // Add a new specialization
  const addSpecialization = () => {
    if (newSpecialization && !specializations.includes(newSpecialization)) {
      setSpecializations([...specializations, newSpecialization]);
      setNewSpecialization("");
    }
  };

  // Remove a specialization
  const removeSpecialization = (index) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  // Add a new certification
  const addCertification = () => {
    if (newCertification && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification("");
    }
  };

  // Remove a certification
  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  // Add a new project type
  const addProjectType = () => {
    if (newProjectType && !projectTypes.includes(newProjectType)) {
      setProjectTypes([...projectTypes, newProjectType]);
      setNewProjectType("");
    }
  };

  // Remove a project type
  const removeProjectType = (index) => {
    setProjectTypes(projectTypes.filter((_, i) => i !== index));
  };

  // Add a new service
  const addService = () => {
    if (newService && !services.includes(newService)) {
      setServices([...services, newService]);
      setNewService("");
    }
  };

  // Remove a service
  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Handle software skills input
  const handleSoftwareChange = (e) => {
    const { name, value } = e.target;
    setNewSoftware({
      ...newSoftware,
      [name]: value,
    });
  };

  // Add a new software skill
  const addSoftwareSkill = () => {
    if (newSoftware.name) {
      setSoftwareSkills([...softwareSkills, newSoftware]);
      setNewSoftware({ name: "", level: "Intermediate" });
    }
  };

  // Remove a software skill
  const removeSoftwareSkill = (index) => {
    setSoftwareSkills(softwareSkills.filter((_, i) => i !== index));
  };

  // Handle language input
  const handleLanguageChange = (e) => {
    const { name, value } = e.target;
    setNewLanguage({
      ...newLanguage,
      [name]: value,
    });
  };

  // Add a new language
  const addLanguage = () => {
    if (newLanguage.language) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage({ language: "", proficiency: "Intermediate" });
    }
  };

  // Remove a language
  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Handle company input
  const handleCompanyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCompany({
      ...newCompany,
      [name]: type === "checkbox" ? checked : value,
    });

    // If it's a current position, clear the end date
    if (name === "isCurrentPosition" && checked) {
      setNewCompany({
        ...newCompany,
        isCurrentPosition: true,
        endDate: "",
      });
    }
  };

  // Add a new company to history
  const addCompany = () => {
    if (newCompany.name && newCompany.position && newCompany.startDate) {
      setCompanyHistory([...companyHistory, newCompany]);
      setNewCompany({
        name: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrentPosition: false,
        description: "",
      });
    }
  };

  // Remove a company from history
  const removeCompany = (index) => {
    setCompanyHistory(companyHistory.filter((_, i) => i !== index));
  };

  // Remove a portfolio preview
  const removePortfolioPreview = (index) => {
    const newPortfolioFiles = [...portfolioFiles];
    const newPreviews = [...portfolioPreviews];

    newPortfolioFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setPortfolioFiles(newPortfolioFiles);
    setPortfolioPreviews(newPreviews);
  };

  // Request to delete an existing portfolio item
  const handleDeletePortfolioItem = (index) => {
    setPortfolioItemToDelete(index);
    setShowDeletePortfolioModal(true);
  };

  // Confirm deletion of portfolio item
  const confirmDeletePortfolioItem = () => {
    const newItems = [...portfolioItems];
    newItems.splice(portfolioItemToDelete, 1);
    setPortfolioItems(newItems);
    setShowDeletePortfolioModal(false);
    setPortfolioItemToDelete(null);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // For multipart/form-data requests with file uploads
    if (profilePictureFile || companyLogoFile || portfolioFiles.length > 0) {
      // Create FormData object for file uploads
      const formDataToSend = new FormData();

      // Add basic form data
      for (const key in formData) {
        if (typeof formData[key] === "object" && formData[key] !== null) {
          Object.entries(formData.location).forEach(([key, value]) => {
            formDataToSend.append(`location[${key}]`, value);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Add files if they exist
      if (profilePictureFile) {
        formDataToSend.append("profilePicture", profilePictureFile);
      }

      if (companyLogoFile) {
        formDataToSend.append("companyLogo", companyLogoFile);
      }

      // Add portfolio files
      portfolioFiles.forEach((file) => {
        formDataToSend.append("portfolio", file);
      });

      // Add existing portfolio items
      formDataToSend.append(
        "existingPortfolio",
        JSON.stringify(portfolioItems)
      );

      // Add arrays - Convert array fields to individual fields to avoid parsing issues
      softwareSkills.forEach((skill, index) => {
        formDataToSend.append(
          `softwareProficiency[${index}][name]`,
          skill.name
        );
        formDataToSend.append(
          `softwareProficiency[${index}][level]`,
          skill.level
        );
        if (skill._id)
          formDataToSend.append(
            `softwareProficiency[${index}][_id]`,
            skill._id
          );
      });

      // Add other arrays similarly if needed
      specializations.forEach((item, index) => {
        formDataToSend.append(`specializations[${index}]`, item);
      });

      // Similarly for other arrays...

      // Dispatch update action
      dispatch(updateArchitectProfile(formDataToSend));
    } else {
      // For regular JSON requests (no files)
      const dataToSend = {
        ...formData,
        specializations,
        certifications,
        projectTypes,
        services,
        softwareProficiency: softwareSkills,
        languages,
        companyHistory,
        existingPortfolio: portfolioItems,
      };

      dispatch(updateArchitectProfile(dataToSend));
    }
  };

  // Cancel editing and return to profile
  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) return <p className="loading">Loading profile data...</p>;
  if (error)
    return (
      <p className="error">Error: {error.message || JSON.stringify(error)}</p>
    );

  return (
    <div className="profile-edit-container">
      <div className="edit-profile-container">
        <h2 className="section-title">Edit Your Professional Profile</h2>

        {updateError && (
          <div className="error-message">
            {updateError.message ||
              "An error occurred while updating your profile."}
          </div>
        )}

        {updateSuccess && (
          <div className="success-message">
            Profile updated successfully! Redirecting to your profile...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div className="form-section">
            <h3>
              <Mail className="section-icon" />
              Basic Information
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="prenom">First Name</label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nomDeFamille">Last Name</label>
                <input
                  type="text"
                  id="nomDeFamille"
                  name="nomDeFamille"
                  value={formData.nomDeFamille}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Professional Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                placeholder="Tell clients about your professional background, approach, and expertise..."
              />
            </div>
          </div>

          {/* Profile Picture Section */}
          <div className="form-section">
            <h3>
              <Camera className="section-icon" />
              Profile Picture
            </h3>

            <div className="profile-upload-container">
              {profilePreview ? (
                <div className="profile-preview">
                  <img src={profilePreview} alt="Profile preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setProfilePictureFile(null);
                      setProfilePreview("");
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Camera size={32} />
                  <p>Upload a professional photo</p>
                </div>
              )}

              <div className="upload-btn-wrapper">
                <button type="button" className="upload-btn">
                  <Upload size={16} /> Choose Image
                </button>
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          {/* Professional Details Section */}
          <div className="form-section">
            <h3>
              <Briefcase className="section-icon" />
              Professional Details
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="experienceYears">Years of Experience</label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  min="0"
                  value={formData.experienceYears}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="specialty">Primary Specialty</label>
                <input
                  type="text"
                  id="specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="companyName">
                  Company Name (if applicable)
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Leave blank if self-employed"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://your-website.com"
                />
              </div>
            </div>
          </div>

          {/* Company Logo Section (conditional) */}
          {formData.companyName && (
            <div className="form-section">
              <h3>
                <Building className="section-icon" />
                Company Logo
              </h3>

              <div className="profile-upload-container">
                {companyLogoPreview ? (
                  <div className="profile-preview">
                    <img src={companyLogoPreview} alt="Company logo preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setCompanyLogoFile(null);
                        setCompanyLogoPreview("");
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <Building size={32} />
                    <p>Upload company logo</p>
                  </div>
                )}

                <div className="upload-btn-wrapper">
                  <button type="button" className="upload-btn">
                    <Upload size={16} /> Choose Logo
                  </button>
                  <input
                    type="file"
                    name="companyLogo"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          <div className="form-section">
            <h3>
              <Globe className="section-icon" />
              Location
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="location.country">Country</label>
                <input
                  type="text"
                  id="location.country"
                  name="location.country"
                  value={formData.location.country}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location.region">Region/State</label>
                <input
                  type="text"
                  id="location.region"
                  name="location.region"
                  value={formData.location.region}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location.city">City</label>
                <input
                  type="text"
                  id="location.city"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="form-section">
            <h3>
              <Award className="section-icon" />
              Education
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="education.degree">Degree</label>
                <input
                  type="text"
                  id="education.degree"
                  name="education.degree"
                  value={formData.education.degree}
                  onChange={handleChange}
                  placeholder="e.g. Bachelor of Architecture"
                />
              </div>

              <div className="form-group">
                <label htmlFor="education.institution">Institution</label>
                <input
                  type="text"
                  id="education.institution"
                  name="education.institution"
                  value={formData.education.institution}
                  onChange={handleChange}
                  placeholder="e.g. University of Architecture"
                />
              </div>

              <div className="form-group">
                <label htmlFor="education.graduationYear">
                  Graduation Year
                </label>
                <input
                  type="number"
                  id="education.graduationYear"
                  name="education.graduationYear"
                  value={formData.education.graduationYear}
                  onChange={handleChange}
                  min="1950"
                  max={new Date().getFullYear()}
                  placeholder={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Specializations Section */}
          <div className="form-section">
            <h3>
              <Briefcase className="section-icon" />
              Areas of Specialization
            </h3>

            <div className="tags-input-container">
              <div className="tag-input-group">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Add a specialization"
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addSpecialization}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="tags-container">
                {specializations.map((spec, index) => (
                  <div key={index} className="tag">
                    {spec}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => removeSpecialization(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Types Section */}
          <div className="form-section">
            <h3>
              <FileText className="section-icon" />
              Project Types
            </h3>

            <div className="tags-input-container">
              <div className="tag-input-group">
                <input
                  type="text"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(e.target.value)}
                  placeholder="Add a project type"
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addProjectType}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="tags-container">
                {projectTypes.map((type, index) => (
                  <div key={index} className="tag">
                    {type}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => removeProjectType(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="form-section">
            <h3>
              <Briefcase className="section-icon" />
              Services Offered
            </h3>

            <div className="tags-input-container">
              <div className="tag-input-group">
                <input
                  type="text"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  placeholder="Add a service"
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addService}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="tags-container">
                {services.map((service, index) => (
                  <div key={index} className="tag">
                    {service}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => removeService(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Software Proficiency Section */}
          <div className="form-section">
            <h3>
              <Code className="section-icon" />
              Software Proficiency
            </h3>

            <div className="software-input-container">
              <div className="software-input-group">
                <input
                  type="text"
                  name="name"
                  value={newSoftware.name}
                  onChange={handleSoftwareChange}
                  placeholder="Software name"
                />
                <select
                  name="level"
                  value={newSoftware.level}
                  onChange={handleSoftwareChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  className="add-software-btn"
                  onClick={addSoftwareSkill}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="software-skills-container">
                {softwareSkills.map((skill, index) => (
                  <div key={index} className="software-skill">
                    <span className="software-name">{skill.name}</span>
                    <span className="software-level">{skill.level}</span>
                    <button
                      type="button"
                      className="remove-software-btn"
                      onClick={() => removeSoftwareSkill(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages Section */}
          <div className="form-section">
            <h3>
              <Globe className="section-icon" />
              Languages
            </h3>

            <div className="language-input-container">
              <div className="language-input-group">
                <input
                  type="text"
                  name="language"
                  value={newLanguage.language}
                  onChange={handleLanguageChange}
                  placeholder="Language"
                />
                <select
                  name="proficiency"
                  value={newLanguage.proficiency}
                  onChange={handleLanguageChange}
                >
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Professional">Professional</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native">Native</option>
                </select>
                <button
                  type="button"
                  className="add-language-btn"
                  onClick={addLanguage}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="languages-container">
                {languages.map((lang, index) => (
                  <div key={index} className="language-item">
                    <span className="language-name">{lang.language}</span>
                    <span className="language-level">{lang.proficiency}</span>
                    <button
                      type="button"
                      className="remove-language-btn"
                      onClick={() => removeLanguage(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company History Section */}
          <div className="form-section">
            <h3>
              <Building className="section-icon" />
              Company History
            </h3>

            <div className="company-input-container">
              <div className="company-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="company-name">Company Name</label>
                    <input
                      type="text"
                      id="company-name"
                      name="name"
                      value={newCompany.name}
                      onChange={handleCompanyChange}
                      placeholder="e.g. Architect Studio"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company-position">Position</label>
                    <input
                      type="text"
                      id="company-position"
                      name="position"
                      value={newCompany.position}
                      onChange={handleCompanyChange}
                      placeholder="e.g. Senior Architect"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="company-start-date">Start Date</label>
                    <input
                      type="date"
                      id="company-start-date"
                      name="startDate"
                      value={newCompany.startDate}
                      onChange={handleCompanyChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company-end-date">End Date</label>
                    <input
                      type="date"
                      id="company-end-date"
                      name="endDate"
                      value={newCompany.endDate}
                      onChange={handleCompanyChange}
                      disabled={newCompany.isCurrentPosition}
                    />

                    <div className="checkbox-group">
                      <input
                        type="checkbox"
                        id="current-position"
                        name="isCurrentPosition"
                        checked={newCompany.isCurrentPosition}
                        onChange={handleCompanyChange}
                      />
                      <label htmlFor="current-position">Current Position</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="company-description">Description</label>
                  <textarea
                    id="company-description"
                    name="description"
                    value={newCompany.description}
                    onChange={handleCompanyChange}
                    rows="3"
                    placeholder="Describe your role and responsibilities..."
                  />
                </div>

                <button
                  type="button"
                  className="add-company-btn"
                  onClick={addCompany}
                >
                  <Plus size={16} /> Add to History
                </button>
              </div>

              <div className="company-history-container">
                {companyHistory.map((company, index) => (
                  <div key={index} className="company-item">
                    <div className="company-header">
                      <h4>{company.name}</h4>
                      <button
                        type="button"
                        className="remove-company-btn"
                        onClick={() => removeCompany(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="company-position">{company.position}</p>
                    <p className="company-dates">
                      {new Date(company.startDate).toLocaleDateString()} -
                      {company.isCurrentPosition
                        ? " Present"
                        : company.endDate
                        ? ` ${new Date(company.endDate).toLocaleDateString()}`
                        : " Not specified"}
                    </p>
                    {company.description && (
                      <p className="company-description">
                        {company.description}
                      </p>
                    )}
                  </div>
                ))}

                {companyHistory.length === 0 && (
                  <p className="no-items-message">
                    No company history added yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Certifications Section */}
          <div className="form-section">
            <h3>
              <Award className="section-icon" />
              Certifications & Licenses
            </h3>

            <div className="tags-input-container">
              <div className="tag-input-group">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification or license"
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={addCertification}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div className="tags-container">
                {certifications.map((cert, index) => (
                  <div key={index} className="tag">
                    {cert}
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={() => removeCertification(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Upload Section */}
          <div className="form-section">
            <h3>
              <FileText className="section-icon" />
              Portfolio
            </h3>

            <div className="portfolio-section">
              {/* Existing Portfolio Items */}
              {portfolioItems.length > 0 && (
                <div className="existing-portfolio">
                  <h4>Current Portfolio Items</h4>
                  <div className="portfolio-grid">
                    {portfolioItems.map((item, index) => (
                      <div key={index} className="portfolio-item">
                        <img
                          src={item.imageUrl}
                          alt={item.title || `Portfolio item ${index + 1}`}
                        />
                        <div className="portfolio-item-overlay">
                          <h5>{item.title || `Project ${index + 1}`}</h5>
                          <button
                            type="button"
                            className="delete-portfolio-btn"
                            onClick={() => handleDeletePortfolioItem(index)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Portfolio Upload */}
              <div className="portfolio-upload">
                <h4>Add New Portfolio Items</h4>

                <div className="portfolio-upload-container">
                  <div className="upload-btn-wrapper">
                    <button type="button" className="upload-btn">
                      <Upload size={16} /> Choose Images
                    </button>
                    <input
                      type="file"
                      name="portfolio"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                    />
                  </div>

                  <p className="upload-help">
                    Upload high-quality images of your completed projects
                  </p>
                </div>

                {/* New Portfolio Previews */}
                {portfolioPreviews.length > 0 && (
                  <div className="portfolio-previews">
                    <h4>New Images to Upload</h4>
                    <div className="portfolio-grid">
                      {portfolioPreviews.map((preview, index) => (
                        <div key={index} className="portfolio-preview">
                          <img
                            src={preview}
                            alt={`New portfolio item ${index + 1}`}
                          />
                          <div className="portfolio-preview-overlay">
                            <button
                              type="button"
                              className="remove-preview-btn"
                              onClick={() => removePortfolioPreview(index)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="form-section">
            <h3>
              <Globe className="section-icon" />
              Social Media
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="socialMedia.linkedin">LinkedIn</label>
                <input
                  type="url"
                  id="socialMedia.linkedin"
                  name="socialMedia.linkedin"
                  value={formData.socialMedia.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialMedia.instagram">Instagram</label>
                <input
                  type="url"
                  id="socialMedia.instagram"
                  name="socialMedia.instagram"
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/your-profile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialMedia.facebook">Facebook</label>
                <input
                  type="url"
                  id="socialMedia.facebook"
                  name="socialMedia.facebook"
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/your-profile"
                />
              </div>

              <div className="form-group">
                <label htmlFor="socialMedia.twitter">Twitter</label>
                <input
                  type="url"
                  id="socialMedia.twitter"
                  name="socialMedia.twitter"
                  value={formData.socialMedia.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/your-handle"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              <X size={16} /> Cancel
            </button>

            <button type="submit" className="save-btn" disabled={updateLoading}>
              {updateLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={16} /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>

        {/* Delete Portfolio Modal */}
        {showDeletePortfolioModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h4>Delete Portfolio Item</h4>
              <p>
                Are you sure you want to delete this portfolio item? This action
                cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowDeletePortfolioModal(false);
                    setPortfolioItemToDelete(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={confirmDeletePortfolioItem}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEdit;
