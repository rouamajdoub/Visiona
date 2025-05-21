import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  selectAuthStatus,
  selectAuthError,
  resetStatus,
  fetchGlobalOptions,
  fetchServiceCategories,
  selectCertifications,
  selectSoftwareProficiency,
  selectServiceCategories,
  selectGlobalOptionsStatus,
  selectServiceCategoriesStatus,
} from "../../redux/slices/authSlice";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaGraduationCap,
  FaTools,
  FaIdCard,
  FaFileAlt,
  FaCheck,
  FaClock,
  FaCode,
  FaLink,
  FaCertificate,
  FaLinkedin,
  FaInstagram,
  FaArrowRight,
  FaArrowLeft,
  FaUserTie,
  FaUpload,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import "./styles/Auth.css";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  // Get predefined options from Redux store
  const certifications = useSelector(selectCertifications);
  const softwareProficiencyOptions = useSelector(selectSoftwareProficiency);
  const serviceCategories = useSelector(selectServiceCategories);
  const globalOptionsStatus = useSelector(selectGlobalOptionsStatus);
  const serviceCategoriesStatus = useSelector(selectServiceCategoriesStatus);

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [educationFields, setEducationFields] = useState([
    { degree: "", institution: "", graduationYear: "" },
  ]);
  const [softwareFields, setSoftwareFields] = useState([
    { name: "", level: "" },
  ]);

  // Form data state to hold all data across steps
  const [formData, setFormData] = useState({});

  // New state for file uploads
  const [cinFile, setCinFile] = useState(null);
  const [patenteFile, setPatenteFile] = useState(null);

  // New state for autocomplete fields
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);

  // Input field states for autocomplete
  const [serviceInput, setServiceInput] = useState("");
  const [certificationInput, setCertificationInput] = useState("");
  const [softwareInput, setSoftwareInput] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  // Dropdown visibility states
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCertificationDropdown, setShowCertificationDropdown] =
    useState(false);
  const [showSoftwareDropdown, setShowSoftwareDropdown] = useState(false);

  // Refs for dropdown click outside detection
  const serviceDropdownRef = useRef(null);
  const certificationDropdownRef = useRef(null);
  const softwareDropdownRef = useRef(null);

  // Fetch predefined options when component mounts
  useEffect(() => {
    dispatch(fetchGlobalOptions("certification"));
    dispatch(fetchGlobalOptions("software"));
    dispatch(fetchServiceCategories());
  }, [dispatch]);

  // Handle clicks outside dropdown to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target)
      ) {
        setShowServiceDropdown(false);
      }
      if (
        certificationDropdownRef.current &&
        !certificationDropdownRef.current.contains(event.target)
      ) {
        setShowCertificationDropdown(false);
      }
      if (
        softwareDropdownRef.current &&
        !softwareDropdownRef.current.contains(event.target)
      ) {
        setShowSoftwareDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (authStatus === "succeeded") {
      if (userType === "architect") {
        setIsSubmitted(true);
        // Skip to confirmation step
        setStep(userType === "architect" ? 8 : 4);
      } else {
        const timer = setTimeout(() => {
          navigate("/login");
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [authStatus, navigate, userType]);

  useEffect(() => {
    return () => {
      dispatch(resetStatus());
    };
  }, [dispatch]);

  const addEducationField = () => {
    setEducationFields([
      ...educationFields,
      { degree: "", institution: "", graduationYear: "" },
    ]);
  };

  const removeEducationField = (index) => {
    const values = [...educationFields];
    values.splice(index, 1);
    setEducationFields(values);
  };

  const addSoftwareField = () => {
    setSoftwareFields([...softwareFields, { name: "", level: "" }]);
  };

  const removeSoftwareField = (index) => {
    const values = [...softwareFields];
    values.splice(index, 1);
    setSoftwareFields(values);
  };

  // Service selection handlers
  const handleServiceInputChange = (e) => {
    setServiceInput(e.target.value);
    setShowServiceDropdown(true);
  };

  const addService = (service) => {
    if (!selectedServices.includes(service)) {
      setSelectedServices([...selectedServices, service]);
    }
    setServiceInput("");
    setShowServiceDropdown(false);
  };

  const removeService = (serviceToRemove) => {
    setSelectedServices(
      selectedServices.filter((service) => service !== serviceToRemove)
    );
  };

  // Certification selection handlers
  const handleCertificationInputChange = (e) => {
    setCertificationInput(e.target.value);
    setShowCertificationDropdown(true);
  };

  const addCertification = (certification) => {
    if (!selectedCertifications.includes(certification)) {
      setSelectedCertifications([...selectedCertifications, certification]);
    }
    setCertificationInput("");
    setShowCertificationDropdown(false);
  };

  const removeCertification = (certificationToRemove) => {
    setSelectedCertifications(
      selectedCertifications.filter((cert) => cert !== certificationToRemove)
    );
  };

  // Software selection handlers
  const handleSoftwareInputChange = (e, index) => {
    setSoftwareInput(e.target.value);
    setShowSoftwareDropdown(true);
  };

  const selectSoftware = (software, index) => {
    const updatedSoftwareFields = [...softwareFields];
    updatedSoftwareFields[index].name = software;
    setSoftwareFields(updatedSoftwareFields);
    setSoftwareInput("");
    setShowSoftwareDropdown(false);
  };

  // File input handlers
  const handleCinFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCinFile(e.target.files[0]);
    }
  };

  const handlePatenteFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPatenteFile(e.target.files[0]);
    }
  };
  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const onSubmit = (data) => {
    // Handle form submission based on current step
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);

    // If not at final step, go to next step
    if (
      (userType === "client" && step < 3) ||
      (userType === "architect" && step < 7)
    ) {
      handleNextStep();
      return;
    }

    // At final step, prepare data for submission
    if (userType === "client") {
      const submitData = {
        ...updatedFormData,
        pays: updatedFormData.location?.country,
        region: updatedFormData.location?.region,
        city: updatedFormData.location?.city || "",
        role: userType,
      };
      delete submitData.location;

      dispatch(registerUser(submitData));
    } else if (userType === "architect") {
      // Create FormData for file uploads
      const formDataToSubmit = new FormData();

      // Add basic fields to FormData
      formDataToSubmit.append("role", userType);
      formDataToSubmit.append("pseudo", updatedFormData.pseudo);
      formDataToSubmit.append("prenom", updatedFormData.prenom);
      formDataToSubmit.append("nomDeFamille", updatedFormData.nomDeFamille);
      formDataToSubmit.append("email", updatedFormData.email);
      formDataToSubmit.append("password", updatedFormData.password);
      formDataToSubmit.append("cin", updatedFormData.cin);
      formDataToSubmit.append("patenteNumber", updatedFormData.patenteNumber);
      formDataToSubmit.append("companyName", updatedFormData.companyName);
      formDataToSubmit.append(
        "experienceYears",
        updatedFormData.experienceYears
      );
      if (profilePicture) {
        formDataToSubmit.append("profilePicture", profilePicture);
      }
      // Add files to FormData
      if (cinFile) {
        formDataToSubmit.append("cinFile", cinFile);
      }

      if (patenteFile) {
        formDataToSubmit.append("patentFile", patenteFile);
      }

      // Add arrays as JSON strings
      formDataToSubmit.append(
        "specialization",
        JSON.stringify(selectedServices)
      );
      formDataToSubmit.append(
        "certifications",
        JSON.stringify(selectedCertifications)
      );

      // Add education and software proficiency as JSON strings
      const validEducation = educationFields.filter(
        (edu) => edu.degree && edu.institution && edu.graduationYear
      );
      formDataToSubmit.append("education", JSON.stringify(validEducation));

      const validSoftware = softwareFields.filter(
        (soft) => soft.name && soft.level
      );
      formDataToSubmit.append(
        "softwareProficiency",
        JSON.stringify(validSoftware)
      );

      // Location fields
      formDataToSubmit.append("pays", updatedFormData.pays || "");
      formDataToSubmit.append("region", updatedFormData.region || "");
      formDataToSubmit.append("city", updatedFormData.city || "");

      // Portfolio and social media
      formDataToSubmit.append(
        "portfolioURL",
        updatedFormData.portfolioURL || ""
      );
      formDataToSubmit.append("website", updatedFormData.website || "");

      if (updatedFormData.socialMedia?.linkedin) {
        formDataToSubmit.append(
          "socialMedia.linkedin",
          updatedFormData.socialMedia.linkedin
        );
      }

      if (updatedFormData.socialMedia?.instagram) {
        formDataToSubmit.append(
          "socialMedia.instagram",
          updatedFormData.socialMedia.instagram
        );
      }

      console.log("Submitting registration data");
      dispatch(registerUser(formDataToSubmit));
    }
  };

  const handleNextStep = () => {
    // Save current form data before moving to next step
    const currentFormData = watch();
    setFormData({ ...formData, ...currentFormData });
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const selectUserRole = (role) => {
    setUserType(role);
    setValue("role", role);
    handleNextStep();
  };

  const renderRegistrationStatus = () => {
    if (authStatus === "loading") {
      return (
        <div className="registration-status text-blue-600">
          Processing your registration...
        </div>
      );
    }
    if (authStatus === "failed") {
      return (
        <div className="registration-status text-red-600">
          {authError || "Registration failed. Please try again."}
        </div>
      );
    }
    return null;
  };

  // Progress indicator based on user type and current step
  const renderProgressIndicator = () => {
    const totalSteps = userType === "architect" ? 7 : 3;
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
      <div className="step-indicator">
        {steps.map((s) => (
          <div key={s} className={`step-circle ${s === step ? "active" : ""}`}>
            {s}
          </div>
        ))}
      </div>
    );
  };

  // Filter functions for autocomplete
  const filteredServices =
    serviceInput === ""
      ? serviceCategories
      : serviceCategories.filter((service) =>
          service.name.toLowerCase().includes(serviceInput.toLowerCase())
        );

  const filteredCertifications =
    certificationInput === ""
      ? certifications
      : certifications.filter((cert) =>
          cert.name.toLowerCase().includes(certificationInput.toLowerCase())
        );

  const filteredSoftware = (index) => {
    const input = softwareFields[index]?.name || "";
    return input === ""
      ? softwareProficiencyOptions
      : softwareProficiencyOptions.filter((software) =>
          software.name.toLowerCase().includes(input.toLowerCase())
        );
  };

  return (
    <div className="signup-wrapper">
      {/* Render progress indicator for steps after role selection */}
      {step > 1 && renderProgressIndicator()}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="form-step role-selection-step">
            <h2>Welcome to Our Platform!</h2>
            <p className="role-intro">
              Please select the type of account you want to create:
            </p>

            <div className="role-buttons">
              <button
                type="button"
                className="role-btn client-btn"
                onClick={() => selectUserRole("client")}
              >
                <FaUser className="role-icon" />
                <div className="role-label">
                  <span>Client</span>
                  <p>Looking for architectural services</p>
                </div>
              </button>

              <button
                type="button"
                className="role-btn architect-btn"
                onClick={() => selectUserRole("architect")}
              >
                <FaUserTie className="role-icon" />
                <div className="role-label">
                  <span>Architect</span>
                  <p>Offering professional architectural services</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Basic Information (for both user types) */}
        {step === 2 && (
          <div className="form-step">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label>
                <FaUser className="input-icon" /> Username
              </label>
              <input
                {...register("pseudo", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
                defaultValue={formData.pseudo || ""}
                placeholder="Username"
              />
              {errors.pseudo && (
                <p className="error-message">{errors.pseudo.message}</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaUser className="input-icon" /> First Name
                </label>
                <input
                  {...register("prenom", {
                    required: "First name is required",
                  })}
                  defaultValue={formData.prenom || ""}
                  placeholder="First Name"
                />
                {errors.prenom && (
                  <p className="error-message">{errors.prenom.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaUser className="input-icon" /> Last Name
                </label>
                <input
                  {...register("nomDeFamille", {
                    required: "Last name is required",
                  })}
                  defaultValue={formData.nomDeFamille || ""}
                  placeholder="Last Name"
                />
                {errors.nomDeFamille && (
                  <p className="error-message">{errors.nomDeFamille.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" /> Email
              </label>
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Invalid email address",
                  },
                })}
                defaultValue={formData.email || ""}
                placeholder="Email"
                type="email"
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaLock className="input-icon" /> Password
              </label>
              <input
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                defaultValue={formData.password || ""}
                placeholder="Password"
                type="password"
              />
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* CLIENT STEPS */}

        {/* Step 3 for Client: Location */}
        {step === 3 && userType === "client" && (
          <div className="form-step">
            <h2>Location Details</h2>

            <div className="form-group">
              <label>
                <FaGlobe className="input-icon" /> Country
              </label>
              <input
                {...register("location.country", {
                  required: "Country is required",
                })}
                defaultValue={formData.location?.country || ""}
                placeholder="Country"
              />
              {errors.location?.country && (
                <p className="error-message">
                  {errors.location.country.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="input-icon" /> Region
              </label>
              <input
                {...register("location.region", {
                  required: "Region is required",
                })}
                defaultValue={formData.location?.region || ""}
                placeholder="Region"
              />
              {errors.location?.region && (
                <p className="error-message">
                  {errors.location.region.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="input-icon" /> City
              </label>
              <input
                {...register("location.city")}
                defaultValue={formData.location?.city || ""}
                placeholder="City (Optional)"
              />
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Complete Registration <FaCheck />
              </button>
            </div>
          </div>
        )}

        {/* ARCHITECT STEPS */}

        {/* Step 3 for Architect: Personal & Legal Information */}
        {step === 3 && userType === "architect" && (
          <div className="form-step">
            <h2>Personal & Legal Information</h2>

            <div className="form-section">
              <div className="form-group">
                <label>
                  <FaIdCard className="input-icon" /> CIN
                </label>
                <input
                  {...register("cin", { required: "CIN is required" })}
                  defaultValue={formData.cin || ""}
                  placeholder="CIN"
                />
                {errors.cin && (
                  <p className="error-message">{errors.cin.message}</p>
                )}
              </div>

              {/* New CIN Image Upload */}
              <div className="form-group file-upload">
                <label>
                  <FaIdCard className="input-icon" /> CIN Image
                </label>
                <div className="file-input-container">
                  <label className="file-input-label">
                    <input
                      type="file"
                      onChange={handleCinFileChange}
                      accept="image/*"
                      name="cinFile" // This should match the field name expected by backend
                      className="file-input"
                    />
                    <span className="file-input-button">
                      <FaUpload /> {cinFile ? cinFile.name : "Upload CIN Image"}
                    </span>
                  </label>
                  {cinFile && (
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => setCinFile(null)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaFileAlt className="input-icon" /> Patente Number
                </label>
                <input
                  {...register("patenteNumber", {
                    required: "Patente number is required",
                  })}
                  defaultValue={formData.patenteNumber || ""}
                  placeholder="Patente Number"
                />
                {errors.patenteNumber && (
                  <p className="error-message">
                    {errors.patenteNumber.message}
                  </p>
                )}
              </div>

              {/* New Patente PDF Upload */}
              <div className="form-group file-upload">
                <label>
                  <FaFileAlt className="input-icon" /> Patente Document (PDF)
                </label>
                <div className="file-input-container">
                  <label className="file-input-label">
                    <input
                      type="file"
                      onChange={handlePatenteFileChange}
                      accept=".pdf"
                      name="patentFile" // This should match the field name expected by backend
                      className="file-input"
                    />
                    <span className="file-input-button">
                      <FaUpload />{" "}
                      {patenteFile ? patenteFile.name : "Upload Patente PDF"}
                    </span>
                  </label>
                  {patenteFile && (
                    <button
                      type="button"
                      className="file-remove-btn"
                      onClick={() => setPatenteFile(null)}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaBuilding className="input-icon" /> Company Name
                </label>
                <input
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  defaultValue={formData.companyName || ""}
                  placeholder="Company Name"
                />
                {errors.companyName && (
                  <p className="error-message">{errors.companyName.message}</p>
                )}
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 for Architect: Professional Experience */}
        {step === 4 && userType === "architect" && (
          <div className="form-step">
            <h2>Professional Experience</h2>

            <div className="form-section">
              <div className="form-group">
                <label>
                  <FaClock className="input-icon" /> Years of Experience
                </label>
                <input
                  {...register("experienceYears", {
                    required: "Years of experience is required",
                    min: {
                      value: 0,
                      message: "Experience years must be a positive number",
                    },
                  })}
                  defaultValue={formData.experienceYears || ""}
                  placeholder="Years of Experience"
                  type="number"
                />
                {errors.experienceYears && (
                  <p className="error-message">
                    {errors.experienceYears.message}
                  </p>
                )}
              </div>

              {/* New Services Autocomplete */}
              <div className="form-group autocomplete-wrapper">
                <label>
                  <FaCode className="input-icon" /> Services
                </label>
                <div className="selected-items">
                  {selectedServices.map((service, idx) => (
                    <div key={idx} className="selected-item">
                      <span>{service}</span>
                      <button
                        type="button"
                        onClick={() => removeService(service)}
                        className="remove-item-btn"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className="autocomplete-container"
                  ref={serviceDropdownRef}
                >
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={handleServiceInputChange}
                    onFocus={() => setShowServiceDropdown(true)}
                    placeholder="Type to search services"
                    className="autocomplete-input"
                  />
                  {showServiceDropdown && (
                    <div className="autocomplete-dropdown">
                      {globalOptionsStatus === "loading" ||
                      serviceCategoriesStatus === "loading" ? (
                        <div className="dropdown-item">Loading...</div>
                      ) : filteredServices.length > 0 ? (
                        filteredServices.map((service, idx) => (
                          <div
                            key={idx}
                            className="dropdown-item"
                            onClick={() => addService(service.name)}
                          >
                            {service.name}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item no-match">
                          No such service found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* New Certifications Autocomplete */}
              <div className="form-group autocomplete-wrapper">
                <label>
                  <FaCertificate className="input-icon" /> Certifications
                </label>
                <div className="selected-items">
                  {selectedCertifications.map((cert, idx) => (
                    <div key={idx} className="selected-item">
                      <span>{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(cert)}
                        className="remove-item-btn"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className="autocomplete-container"
                  ref={certificationDropdownRef}
                >
                  <input
                    type="text"
                    value={certificationInput}
                    onChange={handleCertificationInputChange}
                    onFocus={() => setShowCertificationDropdown(true)}
                    placeholder="Type to search certifications"
                    className="autocomplete-input"
                  />
                  {showCertificationDropdown && (
                    <div className="autocomplete-dropdown">
                      {globalOptionsStatus === "loading" ? (
                        <div className="dropdown-item">Loading...</div>
                      ) : filteredCertifications.length > 0 ? (
                        filteredCertifications.map((cert, idx) => (
                          <div
                            key={idx}
                            className="dropdown-item"
                            onClick={() => addCertification(cert.name)}
                          >
                            {cert.name}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item no-match">
                          No such certification found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 5 for Architect: Education */}
        {step === 5 && userType === "architect" && (
          <div className="form-step">
            <h2>Education</h2>

            <div className="form-section">
              {educationFields.map((field, index) => (
                <div key={index} className="education-field-group">
                  <div className="education-field-header">
                    <h3>Education #{index + 1}</h3>
                    {educationFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducationField(index)}
                        className="btnremove-field-btn"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FaGraduationCap className="input-icon" /> Degree
                      </label>
                      <input
                        value={field.degree}
                        onChange={(e) => {
                          const values = [...educationFields];
                          values[index].degree = e.target.value;
                          setEducationFields(values);
                        }}
                        placeholder="Degree"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FaBuilding className="input-icon" /> Institution
                      </label>
                      <input
                        value={field.institution}
                        onChange={(e) => {
                          const values = [...educationFields];
                          values[index].institution = e.target.value;
                          setEducationFields(values);
                        }}
                        placeholder="Institution"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FaClock className="input-icon" /> Graduation Year
                      </label>
                      <input
                        value={field.graduationYear}
                        onChange={(e) => {
                          const values = [...educationFields];
                          values[index].graduationYear = e.target.value;
                          setEducationFields(values);
                        }}
                        placeholder="Graduation Year"
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addEducationField}
                className="btn add-field-btn"
              >
                <FaPlus /> Add Another Education
              </button>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 6 for Architect: Software Proficiency */}
        {step === 6 && userType === "architect" && (
          <div className="form-step">
            <h2>Software Proficiency</h2>

            <div className="form-section">
              {softwareFields.map((field, index) => (
                <div key={index} className="software-field-group">
                  <div className="software-field-header">
                    <h3>Software #{index + 1}</h3>
                    {softwareFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSoftwareField(index)}
                        className="btn remove-field-btn"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group autocomplete-wrapper">
                      <label>
                        <FaTools className="input-icon" /> Software Name
                      </label>
                      <div
                        className="autocomplete-container"
                        ref={softwareDropdownRef}
                      >
                        <input
                          value={field.name}
                          onChange={(e) => {
                            const values = [...softwareFields];
                            values[index].name = e.target.value;
                            setSoftwareFields(values);
                            handleSoftwareInputChange(e, index);
                          }}
                          onFocus={() => setShowSoftwareDropdown(true)}
                          placeholder="Software Name"
                          className="autocomplete-input"
                        />
                        {showSoftwareDropdown && (
                          <div className="autocomplete-dropdown">
                            {globalOptionsStatus === "loading" ? (
                              <div className="dropdown-item">Loading...</div>
                            ) : filteredSoftware(index).length > 0 ? (
                              filteredSoftware(index).map((software, idx) => (
                                <div
                                  key={idx}
                                  className="dropdown-item"
                                  onClick={() =>
                                    selectSoftware(software.name, index)
                                  }
                                >
                                  {software.name}
                                </div>
                              ))
                            ) : (
                              <div className="dropdown-item no-match">
                                No such software found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <FaGraduationCap className="input-icon" /> Proficiency
                        Level
                      </label>
                      <select
                        value={field.level}
                        onChange={(e) => {
                          const values = [...softwareFields];
                          values[index].level = e.target.value;
                          setSoftwareFields(values);
                        }}
                      >
                        <option value="">Select Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSoftwareField}
                className="btn add-field-btn"
              >
                <FaPlus /> Add Another Software
              </button>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 7 for Architect: Additional Information */}
        {step === 7 && userType === "architect" && (
          <div className="form-step">
            <h2>Additional Information</h2>

            <div className="form-section">
              <h3>Location</h3>
              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" /> Country
                </label>
                <input
                  {...register("pays", {
                    required: "Country is required",
                  })}
                  defaultValue={formData.pays || ""}
                  placeholder="Country"
                />
                {errors.pays && (
                  <p className="error-message">{errors.pays.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" /> Region
                </label>
                <input
                  {...register("region", {
                    required: "Region is required",
                  })}
                  defaultValue={formData.region || ""}
                  placeholder="Region"
                />
                {errors.region && (
                  <p className="error-message">{errors.region.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" /> City
                </label>
                <input
                  {...register("city")}
                  defaultValue={formData.city || ""}
                  placeholder="City (Optional)"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Online Presence</h3>
              <div className="form-group">
                <label>
                  <FaLink className="input-icon" /> Portfolio URL
                </label>
                <input
                  {...register("portfolioURL")}
                  defaultValue={formData.portfolioURL || ""}
                  placeholder="Portfolio URL (Optional)"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" /> Website
                </label>
                <input
                  {...register("website")}
                  defaultValue={formData.website || ""}
                  placeholder="Website (Optional)"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaLinkedin className="input-icon" /> LinkedIn
                </label>
                <input
                  {...register("socialMedia.linkedin")}
                  defaultValue={formData.socialMedia?.linkedin || ""}
                  placeholder="LinkedIn Profile URL (Optional)"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaInstagram className="input-icon" /> Instagram
                </label>
                <input
                  {...register("socialMedia.instagram")}
                  defaultValue={formData.socialMedia?.instagram || ""}
                  placeholder="Instagram Profile URL (Optional)"
                />
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={handlePrevStep}
                className="btn back-btn"
              >
                <FaArrowLeft /> Back
              </button>
              <button type="submit" className="btn next-btn">
                Complete Registration <FaCheck />
              </button>
            </div>
          </div>
        )}

        {/* Step 8: Confirmation for Architects */}
        {step === 8 && userType === "architect" && (
          <div className="form-step success-step">
            <div className="success-icon">
              <FaCheck size={50} className="check-icon" />
            </div>
            <h2>Registration Request Submitted!</h2>
            <p>
              Thank you for your interest in joining our platform as an
              architect. Your registration request has been sent successfully
              and is now pending admin approval.
            </p>
            <p>
              You will receive a confirmation email shortly with further details
              about the approval process. Please check your email inbox
              (including spam/junk folders).
            </p>
            <p>
              Once approved, you'll receive login credentials and can start
              using our platform's professional features.
            </p>
            <div className="next-steps">
              <h3>What's Next?</h3>
              <ul>
                <li>Check your email for confirmation</li>
                <li>Prepare your portfolio materials</li>
                <li>Wait for admin approval (typically 1-3 business days)</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="btn login-btn"
            >
              Go to Login Page
            </button>
          </div>
        )}

        {/* Registration Status Display */}
        {renderRegistrationStatus()}
      </form>

      {/* Display after successful client registration */}
      {isSubmitted && userType === "client" && (
        <div className="success-message">
          <h2>Registration Successful!</h2>
          <p>Your account has been created successfully.</p>
          <p>You will be redirected to login page shortly...</p>
        </div>
      )}
    </div>
  );
};

export default Signup;
