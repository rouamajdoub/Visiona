import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  selectAuthStatus,
  selectAuthError,
  resetStatus,
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
  FaBriefcase,
  FaUserTie,
} from "react-icons/fa";
import "./styles/Auth.css";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

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
    let submitData = { ...updatedFormData, role: userType };

    if (userType === "client") {
      submitData = {
        ...submitData,
        pays: updatedFormData.location?.country,
        region: updatedFormData.location?.region,
        city: updatedFormData.location?.city || "",
      };
      delete submitData.location;
    } else if (userType === "architect") {
      submitData = {
        ...submitData,
        education: educationFields.filter(
          (edu) => edu.degree && edu.institution && edu.graduationYear
        ),
        softwareProficiency: softwareFields.filter(
          (soft) => soft.name && soft.level
        ),
        certifications: updatedFormData.certifications
          ? updatedFormData.certifications.split(",").map((item) => item.trim())
          : [],
        experienceYears: parseInt(updatedFormData.experienceYears, 10),
        pays: updatedFormData.pays || "",
        region: updatedFormData.region || "",
        city: updatedFormData.city || "",
        coordinates: [0, 0],
      };
    }

    console.log("Submitting registration data:", submitData);
    dispatch(registerUser(submitData));
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

              <div className="form-group">
                <label>
                  <FaCode className="input-icon" /> Specialization
                </label>
                <input
                  {...register("specialization", {
                    required: "Specialization is required",
                  })}
                  defaultValue={formData.specialization || ""}
                  placeholder="Specialization (comma separated)"
                />
                {errors.specialization && (
                  <p className="error-message">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaCertificate className="input-icon" /> Certifications
                </label>
                <input
                  {...register("certifications")}
                  defaultValue={formData.certifications || ""}
                  placeholder="Certifications (comma separated)"
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
                        className="btn remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>

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
              ))}

              <button
                type="button"
                onClick={addEducationField}
                className="btn add-btn"
              >
                Add Another Education
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
                        className="btn remove-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      <FaTools className="input-icon" /> Software Name
                    </label>
                    <input
                      value={field.name}
                      onChange={(e) => {
                        const values = [...softwareFields];
                        values[index].name = e.target.value;
                        setSoftwareFields(values);
                      }}
                      placeholder="Software Name"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaTools className="input-icon" /> Proficiency Level
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
              ))}

              <button
                type="button"
                onClick={addSoftwareField}
                className="btn add-btn"
              >
                Add Another Software
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

        {/* Step 7 for Architect: Contact & Portfolio */}
        {step === 7 && userType === "architect" && (
          <div className="form-step">
            <h2>Contact & Portfolio</h2>

            {/* Location Section */}
            <div className="form-section">
              <h3>Location</h3>
              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" /> Country
                </label>
                <input
                  {...register("pays")}
                  defaultValue={formData.pays || ""}
                  placeholder="Country"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" /> Region
                </label>
                <input
                  {...register("region")}
                  defaultValue={formData.region || ""}
                  placeholder="Region"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaMapMarkerAlt className="input-icon" /> City
                </label>
                <input
                  {...register("city")}
                  defaultValue={formData.city || ""}
                  placeholder="City"
                />
              </div>
            </div>

            {/* Portfolio & Social Media */}
            <div className="form-section">
              <h3>Portfolio & Social Media</h3>
              <div className="form-group">
                <label>
                  <FaLink className="input-icon" /> Portfolio URL
                </label>
                <input
                  {...register("portfolioURL", {
                    required: "Portfolio URL is required",
                    pattern: {
                      value: /^(https?:\/\/)?([\w.-]+)(:[0-9]+)?(\/[^\s]*)?$/,
                      message: "Invalid URL format",
                    },
                  })}
                  defaultValue={formData.portfolioURL || ""}
                  placeholder="Portfolio URL"
                  type="url"
                />
                {errors.portfolioURL && (
                  <p className="error-message">{errors.portfolioURL.message}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FaGlobe className="input-icon" /> Website
                </label>
                <input
                  {...register("website")}
                  defaultValue={formData.website || ""}
                  placeholder="Website (Optional)"
                  type="url"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaLinkedin className="input-icon" /> LinkedIn
                </label>
                <input
                  {...register("socialMedia.linkedin")}
                  defaultValue={formData.socialMedia?.linkedin || ""}
                  placeholder="LinkedIn URL (Optional)"
                  type="url"
                />
              </div>

              <div className="form-group">
                <label>
                  <FaInstagram className="input-icon" /> Instagram
                </label>
                <input
                  {...register("socialMedia.instagram")}
                  defaultValue={formData.socialMedia?.instagram || ""}
                  placeholder="Instagram URL (Optional)"
                  type="url"
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
                Submit Registration Request <FaCheck />
              </button>
            </div>
          </div>
        )}

        {/* Final Step: Confirmation for Architect */}
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

        {renderRegistrationStatus()}
      </form>
    </div>
  );
};

export default Signup;
