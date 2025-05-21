import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createNeedSheet,
  updateFormData,
  resetFormData,
  addService,
  removeService,
  updateLocation,
  selectNeedSheetFormData,
  selectNeedSheetLoading,
  selectNeedSheetSuccess,
  selectNeedSheetError,
  selectNeedSheetServices,
  selectNeedSheetLocation,
} from "../../../../redux/slices/needSheetSlice";

import "./NeedSheetForm.css";

const NeedSheetForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state with updated selectors
  const formData = useSelector(selectNeedSheetFormData);
  const loading = useSelector(selectNeedSheetLoading);
  const success = useSelector(selectNeedSheetSuccess);
  const error = useSelector(selectNeedSheetError);
  const services = useSelector(selectNeedSheetServices);
  const location = useSelector(selectNeedSheetLocation);

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState({
    projectTypes: [],
    propertyType: "",
    location: {
      country: "Tunisia",
      region: "",
      city: "",
      postalCode: "",
    },
    totalSurface: "",
    workSurface: "",
    ownershipStatus: "",
    services: [],
    startTime: "",
    deadline: "",
    projectDescription: "",
    budget: {
      min: "",
      max: "",
    },
  });

  // Constants for form options
  const projectTypeOptions = [
    "Renovation",
    "Construction",
    "Interior Arrangement",
    "Extension",
    "Superstructure",
    "Exterior Arrangement",
    "Other",
  ];

  const propertyTypeOptions = [
    "Apartment",
    "House",
    "Commercial Space",
    "Professional Building",
    "Other",
  ];

  const ownershipStatusOptions = ["Owner", "Renter", "Representative"];

  const serviceCategories = {
    "Architectural Design": [
      "Residential Architecture",
      "Commercial Architecture",
      "Industrial Architecture",
      "Renovation and Adaptive Reuse",
      "Space Programming and Planning",
      "Conceptual/Schematic Design",
      "Design Development",
      "Construction Documentation",
      "Building Code and Code Compliance",
    ],
    "Interior Design": [
      "Client Consultation and Programming",
      "Interior Space Planning",
      "Interior Concept Development",
      "3D Interior Renderings and Visualization",
      "Material and Finish Selection",
      "Lighting and Color Design",
      "Furniture, Fixtures & Equipment (FF&E)",
      "Interior Renovation and Restoration",
      "Interior Project Coordination and Management",
    ],
    "Landscape Architecture": [
      "Site Analysis and Conceptual Landscape Design",
      "Landscape Master Planning",
      "Planting Design",
      "Hardscape Design",
      "Water Feature Design",
      "Sustainability and Environmental Landscape Design",
      "Urban and Streetscape Design",
      "Landscape Construction Documentation and Administration",
      "Landscape Maintenance and Management Planning",
    ],
    "Urban Planning": [
      "Land Use and Zoning Analysis",
      "Site Planning and Subdivision Layout",
      "Zoning Code Preparation",
      "Comprehensive and Master Planning",
      "Urban Design and Redevelopment",
      "Resilience and Sustainability Planning",
      "Community Engagement in Planning",
      "GIS and Urban Data Analysis",
    ],
    "Specialized Consulting": [
      "Sustainability Consulting",
      "Heritage and Historic Preservation",
      "Accessibility Consulting",
    ],
    "Project Management and Supervision": [
      "Project Scheduling and Cost Control",
      "Contract and Tender Management",
      "Construction Supervision",
      "Quality Assurance and Quality Control",
      "Progress Monitoring and Reporting",
      "Safety and Compliance Oversight",
      "Punch List and Project Closeout",
    ],
    "Feasibility and Site Analysis": [
      "Site Inventory and Analysis",
      "Concept Feasibility Studies",
      "Regulatory Feasibility Analysis",
      "Market and Program Studies",
      "Environmental and Impact Assessments",
    ],
    "3D Modeling and BIM": [
      "3D CAD Modeling",
      "Building Information Modeling (BIM)",
      "3D Renderings and Visualizations",
      "Virtual and Augmented Reality",
      "Laser Scanning and Point-Cloud Services",
    ],
    "Permit Drawings and Approvals": [
      "Permit Drawing Preparation",
      "Regulatory Submissions",
      "Code Compliance Documentation",
      "Official Hearings and Negotiations",
    ],
  };

  const startTimeOptions = ["ASAP", "1-3 months", "6 months", "Flexible"];

  useEffect(() => {
    // Initialize form with any saved data from Redux
    if (Object.keys(formData).length > 0) {
      setFormValues({
        ...formValues,
        ...formData,
      });
    }

    return () => {
      // Clean up when component unmounts
      // dispatch(resetFormData());
    };
  }, []);

  useEffect(() => {
    // Handle form submission success
    if (success) {
      // Navigate to success page or list of need sheets
      navigate("/need-sheets");
    }
  }, [success, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects (location, budget)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      // Special handling for location
      if (parent === "location") {
        dispatch(updateLocation({ [child]: value }));

        setFormValues({
          ...formValues,
          [parent]: {
            ...formValues[parent],
            [child]: value,
          },
        });
      } else {
        setFormValues({
          ...formValues,
          [parent]: {
            ...formValues[parent],
            [child]: value,
          },
        });
      }
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  // Handle checkbox changes for multi-select options
  const handleCheckboxChange = (field, value) => {
    // Clone the current array
    const currentValues = [...formValues[field]];

    // Toggle the value
    if (currentValues.includes(value)) {
      const newValues = currentValues.filter((item) => item !== value);
      setFormValues({
        ...formValues,
        [field]: newValues,
      });
    } else {
      setFormValues({
        ...formValues,
        [field]: [...currentValues, value],
      });
    }
  };

  // Handle service selection with the updated structure
  const handleServiceChange = (category, subcategory) => {
    // Find if the category already exists in services
    const existingServiceIndex = formValues.services.findIndex(
      (service) => service.category === category
    );

    if (existingServiceIndex !== -1) {
      // Category exists, update subcategories
      const updatedServices = [...formValues.services];
      const currentSubcategories =
        updatedServices[existingServiceIndex].subcategories || [];

      // Toggle subcategory
      if (currentSubcategories.includes(subcategory)) {
        // Remove subcategory
        updatedServices[existingServiceIndex].subcategories =
          currentSubcategories.filter((sub) => sub !== subcategory);

        // If no subcategories left, remove the category
        if (updatedServices[existingServiceIndex].subcategories.length === 0) {
          dispatch(removeService(category));
          updatedServices.splice(existingServiceIndex, 1);
        } else {
          // Update service with new subcategories
          dispatch(
            addService({
              category: category,
              subcategories:
                updatedServices[existingServiceIndex].subcategories,
            })
          );
        }
      } else {
        // Add subcategory
        updatedServices[existingServiceIndex].subcategories = [
          ...currentSubcategories,
          subcategory,
        ];

        // Update service with new subcategories
        dispatch(
          addService({
            category: category,
            subcategories: updatedServices[existingServiceIndex].subcategories,
          })
        );
      }

      setFormValues({
        ...formValues,
        services: updatedServices,
      });
    } else {
      // Category doesn't exist, add it with the subcategory
      const newService = {
        category: category,
        subcategories: [subcategory],
      };

      dispatch(addService(newService));

      setFormValues({
        ...formValues,
        services: [...formValues.services, newService],
      });
    }
  };

  // Check if a subcategory is selected
  const isSubcategorySelected = (category, subcategory) => {
    const serviceEntry = formValues.services.find(
      (service) => service.category === category
    );

    return (
      serviceEntry &&
      serviceEntry.subcategories &&
      serviceEntry.subcategories.includes(subcategory)
    );
  };

  // Navigate to the next step
  const handleNextStep = () => {
    // Save current step data to Redux
    dispatch(updateFormData(formValues));
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  // Navigate to the previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createNeedSheet(formValues));
  };

  // Number input validation
  const handleNumberInput = (e, field) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      handleInputChange({
        target: { name: field, value },
      });
    }
  };

  // Format date for deadline input
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Render the progress bar
  const renderProgressBar = () => {
    const totalSteps = 7;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="step-indicator">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      </div>
    );
  };

  // Validate the current step
  const validateStep = () => {
    switch (currentStep) {
      case 1: // Project Type
        return formValues.projectTypes.length > 0;
      case 2: // Property Type
        return formValues.propertyType !== "";
      case 3: // Location
        return (
          formValues.location.country !== "" &&
          formValues.location.region !== ""
        );
      case 4: // Property Details
        return (
          formValues.totalSurface !== "" &&
          formValues.workSurface !== "" &&
          formValues.ownershipStatus !== ""
        );
      case 5: // Services
        return formValues.services.length > 0;
      case 6: // Timeline
        return formValues.startTime !== "";
      case 7: // Description & Budget
        return (
          formValues.projectDescription !== "" &&
          formValues.budget.min !== "" &&
          formValues.budget.max !== ""
        );
      default:
        return true;
    }
  };

  // Render current step form
  const renderStepForm = () => {
    switch (currentStep) {
      case 1:
        return renderProjectTypeStep();
      case 2:
        return renderPropertyTypeStep();
      case 3:
        return renderLocationStep();
      case 4:
        return renderPropertyDetailsStep();
      case 5:
        return renderServicesStep();
      case 6:
        return renderTimelineStep();
      case 7:
        return renderDescriptionStep();
      default:
        return <div>Unknown step</div>;
    }
  };

  // Step 1: Project Type
  const renderProjectTypeStep = () => {
    return (
      <div className="form-step">
        <h2>What type of project are you planning?</h2>
        <p className="step-description">
          Select all that apply to your project.
        </p>

        <div className="checkbox-grid">
          {projectTypeOptions.map((type) => (
            <div className="checkbox-item" key={type}>
              <input
                type="checkbox"
                id={`project-${type}`}
                checked={formValues.projectTypes.includes(type)}
                onChange={() => handleCheckboxChange("projectTypes", type)}
              />
              <label htmlFor={`project-${type}`}>{type}</label>
            </div>
          ))}
        </div>

        {formValues.projectTypes.includes("Other") && (
          <div className="form-group">
            <label htmlFor="otherProjectType">Please specify:</label>
            <input
              type="text"
              id="otherProjectType"
              name="otherProjectType"
              value={formValues.otherProjectType || ""}
              onChange={handleInputChange}
              placeholder="Describe your project type"
            />
          </div>
        )}
      </div>
    );
  };

  // Step 2: Property Type
  const renderPropertyTypeStep = () => {
    return (
      <div className="form-step">
        <h2>What type of property is involved?</h2>
        <p className="step-description">
          Select the property type for your project.
        </p>

        <div className="radio-buttons">
          {propertyTypeOptions.map((type) => (
            <div className="radio-item" key={type}>
              <input
                type="radio"
                id={`property-${type}`}
                name="propertyType"
                value={type}
                checked={formValues.propertyType === type}
                onChange={handleInputChange}
              />
              <label htmlFor={`property-${type}`}>{type}</label>
            </div>
          ))}
        </div>

        {formValues.propertyType === "Other" && (
          <div className="form-group">
            <label htmlFor="otherPropertyType">Please specify:</label>
            <input
              type="text"
              id="otherPropertyType"
              name="otherPropertyType"
              value={formValues.otherPropertyType || ""}
              onChange={handleInputChange}
              placeholder="Describe your property type"
            />
          </div>
        )}
      </div>
    );
  };

  // Step 3: Location
  const renderLocationStep = () => {
    return (
      <div className="form-step">
        <h2>Where is your project located?</h2>
        <p className="step-description">
          Please provide the location details for your project.
        </p>

        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <input
            type="text"
            id="country"
            name="location.country"
            value={formValues.location.country}
            onChange={handleInputChange}
            placeholder="Country"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="region">Region/State *</label>
          <input
            type="text"
            id="region"
            name="location.region"
            value={formValues.location.region}
            onChange={handleInputChange}
            placeholder="Region or State"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="location.city"
            value={formValues.location.city}
            onChange={handleInputChange}
            placeholder="City"
          />
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input
            type="text"
            id="postalCode"
            name="location.postalCode"
            value={formValues.location.postalCode}
            onChange={handleInputChange}
            placeholder="Postal Code"
          />
        </div>
      </div>
    );
  };

  // Step 4: Property Details
  const renderPropertyDetailsStep = () => {
    return (
      <div className="form-step">
        <h2>Tell us about your property</h2>
        <p className="step-description">
          Please provide details about the property dimensions and ownership.
        </p>

        <div className="form-group">
          <label htmlFor="totalSurface">Total Surface Area (m²) *</label>
          <input
            type="text"
            id="totalSurface"
            name="totalSurface"
            value={formValues.totalSurface}
            onChange={(e) => handleNumberInput(e, "totalSurface")}
            placeholder="Total area in square meters"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="workSurface">Work Surface Area (m²) *</label>
          <input
            type="text"
            id="workSurface"
            name="workSurface"
            value={formValues.workSurface}
            onChange={(e) => handleNumberInput(e, "workSurface")}
            placeholder="Area where work will be done"
            required
          />
        </div>

        <div className="form-group">
          <label>Ownership Status *</label>
          <div className="radio-buttons">
            {ownershipStatusOptions.map((status) => (
              <div className="radio-item" key={status}>
                <input
                  type="radio"
                  id={`ownership-${status}`}
                  name="ownershipStatus"
                  value={status}
                  checked={formValues.ownershipStatus === status}
                  onChange={handleInputChange}
                />
                <label htmlFor={`ownership-${status}`}>{status}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Services - Updated to use new service structure
  const renderServicesStep = () => {
    return (
      <div className="form-step">
        <h2>What services do you need?</h2>
        <p className="step-description">
          Select all services that you're interested in for your project.
        </p>

        <div className="services-container">
          {Object.entries(serviceCategories).map(
            ([category, subcategories]) => (
              <div className="service-category" key={category}>
                <h3>{category}</h3>
                <div className="checkbox-grid">
                  {subcategories.map((subcategory) => (
                    <div className="checkbox-item" key={subcategory}>
                      <input
                        type="checkbox"
                        id={`service-${subcategory}`}
                        checked={isSubcategorySelected(category, subcategory)}
                        onChange={() =>
                          handleServiceChange(category, subcategory)
                        }
                      />
                      <label htmlFor={`service-${subcategory}`}>
                        {subcategory}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Step 6: Timeline
  const renderTimelineStep = () => {
    return (
      <div className="form-step">
        <h2>When would you like to start?</h2>
        <p className="step-description">
          Please provide your preferred timeline for the project.
        </p>

        <div className="form-group">
          <label>When do you want to start? *</label>
          <div className="radio-buttons">
            {startTimeOptions.map((option) => (
              <div className="radio-item" key={option}>
                <input
                  type="radio"
                  id={`start-${option}`}
                  name="startTime"
                  value={option}
                  checked={formValues.startTime === option}
                  onChange={handleInputChange}
                />
                <label htmlFor={`start-${option}`}>{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Do you have a deadline? (optional)</label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formatDateForInput(formValues.deadline)}
            onChange={handleInputChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>
    );
  };

  // Step 7: Description and Budget
  const renderDescriptionStep = () => {
    return (
      <div className="form-step">
        <h2>Project Description & Budget</h2>
        <p className="step-description">
          Please provide more details about your project and your budget range.
        </p>

        <div className="form-group">
          <label htmlFor="projectDescription">
            Project Description *{" "}
            <span className="char-count">
              {formValues.projectDescription.length}/2000
            </span>
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            value={formValues.projectDescription}
            onChange={handleInputChange}
            placeholder="Describe your project, including any specific requirements or preferences"
            maxLength="2000"
            rows="6"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Budget Range (in your local currency) *</label>
          <div className="budget-inputs">
            <div className="budget-input">
              <label htmlFor="budgetMin">Minimum</label>
              <input
                type="text"
                id="budgetMin"
                name="budget.min"
                value={formValues.budget.min}
                onChange={(e) => handleNumberInput(e, "budget.min")}
                placeholder="Min budget"
                required
              />
            </div>
            <div className="budget-input">
              <label htmlFor="budgetMax">Maximum</label>
              <input
                type="text"
                id="budgetMax"
                name="budget.max"
                value={formValues.budget.max}
                onChange={(e) => handleNumberInput(e, "budget.max")}
                placeholder="Max budget"
                required
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation buttons
  const renderNavigationButtons = () => {
    const isLastStep = currentStep === 7;
    const isStepValid = validateStep();

    return (
      <div className="form-navigation">
        {currentStep > 1 && (
          <button
            type="button"
            className="prev-button"
            onClick={handlePrevStep}
          >
            Previous
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            className="next-button"
            onClick={handleNextStep}
            disabled={!isStepValid}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="submit-button"
            disabled={!isStepValid || loading}
          >
            {loading ? "Submitting..." : "Submit Need Sheet"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="need-sheet-form-container">
      <h1 className="form-title">Create Your Need Sheet</h1>

      {renderProgressBar()}

      <form onSubmit={handleSubmit}>
        {renderStepForm()}
        {renderNavigationButtons()}
      </form>

      {error && (
        <div className="error-message">
          {typeof error === "string"
            ? error
            : "An error occurred. Please try again."}
        </div>
      )}
    </div>
  );
};

export default NeedSheetForm;
