import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/slices/authSlice"; // Adjust the import path as needed

const RegisterForm = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // State for form fields
  const [formData, setFormData] = useState({
    role: "client", // default role
    pseudo: "",
    prenom: "",
    nomDeFamille: "",
    email: "",
    password: "",
    pays: "",
    region: "",
    city: "",
    // Architect specific fields
    patenteNumber: "",
    companyName: "",
    experienceYears: "",
    specialization: [],
    portfolioURL: "",
  });

  // State for file inputs
  const [files, setFiles] = useState({
    patentFile: null,
    cinFile: null,
    profilePicture: null,
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles((prev) => ({
      ...prev,
      [name]: fileList[0], // Get the first file
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create FormData object to send both text fields and files
    const submitData = new FormData();

    // Add all text fields to FormData
    Object.keys(formData).forEach((key) => {
      // Handle arrays differently
      if (Array.isArray(formData[key])) {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    // Add files to FormData if they exist
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        submitData.append(key, files[key]);
      }
    });

    // Dispatch register action
    dispatch(registerUser(submitData));
  };

  return (
    <div className="register-form">
      <h2>
        Register {formData.role === "architect" ? "as Architect" : "as Client"}
      </h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <div className="form-group">
          <label>Register as:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="client">Client</option>
            <option value="architect">Architect</option>
          </select>
        </div>

        {/* Basic Info Fields */}
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="pseudo"
            value={formData.pseudo}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="nomDeFamille"
            value={formData.nomDeFamille}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Country:</label>
          <input
            type="text"
            name="pays"
            value={formData.pays}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Region:</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />
        </div>

        {/* Profile Picture - for all users */}
        <div className="form-group">
          <label>Profile Picture (optional):</label>
          <input
            type="file"
            name="profilePicture"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        {/* Architect-specific fields */}
        {formData.role === "architect" && (
          <>
            <div className="form-group">
              <label>Patente Number:</label>
              <input
                type="text"
                name="patenteNumber"
                value={formData.patenteNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name:</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Years of Experience:</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Portfolio URL:</label>
              <input
                type="url"
                name="portfolioURL"
                value={formData.portfolioURL}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Patent File (PDF):</label>
              <input
                type="file"
                name="patentFile"
                onChange={handleFileChange}
                accept=".pdf"
                required
              />
            </div>

            <div className="form-group">
              <label>CIN File (Image or PDF):</label>
              <input
                type="file"
                name="cinFile"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
