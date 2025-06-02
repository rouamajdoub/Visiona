// Helper function to get subcategories for a specific category
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Updated imports for the new needsheet slice
import {
  createNeedsheet,
  clearErrors,
  clearSuccess,
} from "../../../../redux/slices/needSheetSlice";

// Import service categories slice
import {
  fetchCategories,
  fetchSubcategories,
  selectAllCategories,
  selectAllSubcategories,
  selectServiceCategoriesStatus,
} from "../../../../redux/slices/serviceCategoriesSlice";

import "./NeedSheetForm.css";

const NeedSheetForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state for needsheet - using direct state access
  const needsheetState = useSelector((state) => state.needsheet || {});
  const loading = needsheetState.loading?.create || false;
  const success = needsheetState.success?.create || false;
  const error = needsheetState.error?.create || null;

  // Redux state for service categories
  const categories = useSelector(selectAllCategories);
  const subcategories = useSelector(selectAllSubcategories);
  const serviceCategoriesStatus = useSelector(selectServiceCategoriesStatus);

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
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
    services: [], // Updated structure: [{ category: "categoryId", subcategories: ["subcategoryId1", "subcategoryId2"] }]
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
  const startTimeOptions = ["ASAP", "1-3 months", "6 months", "Flexible"];

  // Fetch service categories and subcategories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [dispatch]);

  useEffect(() => {
    // Handle form submission success
    if (success) {
      // Clear success state after navigation
      dispatch(clearSuccess());
      // Navigate to the loading page instead of directly to matches
      navigate(`/matching-loading/${needsheetState.currentNeedsheet?._id}`);
    }
  }, [success, navigate, dispatch, needsheetState.currentNeedsheet]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Validation functions
  const validateBudget = (minBudget, maxBudget) => {
    const errors = {};
    const min = parseFloat(minBudget);
    const max = parseFloat(maxBudget);

    if (minBudget && maxBudget && min >= max) {
      errors.budget = "Minimum budget must be less than maximum budget";
    }

    if (minBudget && min <= 0) {
      errors.budgetMin = "Budget must be greater than 0";
    }

    if (maxBudget && max <= 0) {
      errors.budgetMax = "Budget must be greater than 0";
    }

    return errors;
  };

  const validateSurface = (totalSurface, workSurface) => {
    const errors = {};
    const total = parseFloat(totalSurface);
    const work = parseFloat(workSurface);

    if (totalSurface && workSurface && work > total) {
      errors.surface = "Work surface cannot be greater than total surface";
    }

    if (totalSurface && total <= 0) {
      errors.totalSurface = "Total surface must be greater than 0";
    }

    if (workSurface && work <= 0) {
      errors.workSurface = "Work surface must be greater than 0";
    }

    return errors;
  };

  // Update validation errors
  const updateValidationErrors = (newErrors) => {
    setValidationErrors((prev) => ({
      ...prev,
      ...newErrors,
    }));
  };

  const clearValidationError = (errorKey) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[errorKey];
      return newErrors;
    });
  };
  const getSubcategoriesForCategory = (categoryId) => {
    return subcategories.filter(
      (subcategory) => subcategory.parentCategory === categoryId
    );
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects (location, budget)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
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
        [name]: value,
      });
    }
  };

  // Handle checkbox changes for multi-select options
  const handleCheckboxChange = (field, value) => {
    const currentValues = [...formValues[field]];

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

  // Handle service selection with the updated structure using IDs
  const handleServiceChange = (categoryId, subcategoryId) => {
    const existingServiceIndex = formValues.services.findIndex(
      (service) => service.category === categoryId
    );

    if (existingServiceIndex !== -1) {
      // Category exists, update subcategories
      const updatedServices = [...formValues.services];
      const currentSubcategories =
        updatedServices[existingServiceIndex].subcategories || [];

      // Toggle subcategory
      if (currentSubcategories.includes(subcategoryId)) {
        // Remove subcategory
        updatedServices[existingServiceIndex].subcategories =
          currentSubcategories.filter((sub) => sub !== subcategoryId);

        // If no subcategories left, remove the category
        if (updatedServices[existingServiceIndex].subcategories.length === 0) {
          updatedServices.splice(existingServiceIndex, 1);
        }
      } else {
        // Add subcategory
        updatedServices[existingServiceIndex].subcategories = [
          ...currentSubcategories,
          subcategoryId,
        ];
      }

      setFormValues({
        ...formValues,
        services: updatedServices,
      });
    } else {
      // Category doesn't exist, add it with the subcategory
      const newService = {
        category: categoryId,
        subcategories: [subcategoryId],
      };

      setFormValues({
        ...formValues,
        services: [...formValues.services, newService],
      });
    }
  };

  // Check if a subcategory is selected
  const isSubcategorySelected = (categoryId, subcategoryId) => {
    const serviceEntry = formValues.services.find(
      (service) => service.category === categoryId
    );

    return (
      serviceEntry &&
      serviceEntry.subcategories &&
      serviceEntry.subcategories.includes(subcategoryId)
    );
  };

  // Navigate to the next step
  const handleNextStep = () => {
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

    // Transform the form data to match the expected API format
    const transformedData = {
      ...formValues,
      // Convert services structure if needed
      services: formValues.services.map((service) => ({
        category: service.category,
        subcategories: service.subcategories,
      })),
    };

    dispatch(createNeedsheet(transformedData));
  };

  // Number input validation with range checking
  const handleNumberInput = (e, field) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleInputChange({
        target: { name: field, value },
      });

      // Validate based on field type
      if (field.includes("budget")) {
        // Clear budget related errors when user starts typing
        clearValidationError("budget");
        clearValidationError("budgetMin");
        clearValidationError("budgetMax");

        // Validate budget range
        const budgetErrors = validateBudget(
          field === "budget.min" ? value : formValues.budget.min,
          field === "budget.max" ? value : formValues.budget.max
        );
        updateValidationErrors(budgetErrors);
      }

      if (field === "totalSurface" || field === "workSurface") {
        // Clear surface related errors when user starts typing
        clearValidationError("surface");
        clearValidationError("totalSurface");
        clearValidationError("workSurface");

        // Validate surface range
        const surfaceErrors = validateSurface(
          field === "totalSurface" ? value : formValues.totalSurface,
          field === "workSurface" ? value : formValues.workSurface
        );
        updateValidationErrors(surfaceErrors);
      }
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
      case 1:
        return formValues.projectTypes.length > 0;
      case 2:
        return formValues.propertyType !== "";
      case 3:
        return (
          formValues.location.country !== "" &&
          formValues.location.region !== ""
        );
      case 4:
        const surfaceErrors = validateSurface(
          formValues.totalSurface,
          formValues.workSurface
        );
        return (
          formValues.totalSurface !== "" &&
          formValues.workSurface !== "" &&
          formValues.ownershipStatus !== "" &&
          Object.keys(surfaceErrors).length === 0
        );
      case 5:
        return formValues.services.length > 0;
      case 6:
        return formValues.startTime !== "";
      case 7:
        const budgetErrors = validateBudget(
          formValues.budget.min,
          formValues.budget.max
        );
        return (
          formValues.projectDescription !== "" &&
          formValues.budget.min !== "" &&
          formValues.budget.max !== "" &&
          Object.keys(budgetErrors).length === 0
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
            className={validationErrors.totalSurface ? "error" : ""}
            required
          />
          {validationErrors.totalSurface && (
            <span className="error-text">{validationErrors.totalSurface}</span>
          )}
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
            className={validationErrors.workSurface ? "error" : ""}
            required
          />
          {validationErrors.workSurface && (
            <span className="error-text">{validationErrors.workSurface}</span>
          )}
          {validationErrors.surface && (
            <span className="error-text">{validationErrors.surface}</span>
          )}
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

  // Step 5: Services - Updated to use fetched service categories
  const renderServicesStep = () => {
    console.log("Rendering services step:", {
      loading: serviceCategoriesStatus.loading,
      error: serviceCategoriesStatus.error,
      categoriesCount: categories.length,
      subcategoriesCount: subcategories.length,
    });

    if (serviceCategoriesStatus.loading) {
      return (
        <div className="form-step">
          <h2>What services do you need?</h2>
          <div className="loading-message">Loading services...</div>
        </div>
      );
    }

    if (serviceCategoriesStatus.error) {
      return (
        <div className="form-step">
          <h2>What services do you need?</h2>
          <div className="error-message">
            Error loading services: {serviceCategoriesStatus.error}
          </div>
          <button
            type="button"
            onClick={() => {
              dispatch(fetchCategories());
              dispatch(fetchSubcategories());
            }}
            className="retry-button"
          >
            Retry Loading Services
          </button>
        </div>
      );
    }

    return (
      <div className="form-step">
        <h2>What services do you need?</h2>
        <p className="step-description">
          Select all services that you're interested in for your project.
        </p>

        <div className="services-container">
          {categories.map((category) => {
            const categorySubcategories = getSubcategoriesForCategory(
              category._id
            );

            console.log(`Category ${category.name}:`, {
              categoryId: category._id,
              subcategoriesFound: categorySubcategories.length,
              subcategories: categorySubcategories,
            });

            if (categorySubcategories.length === 0) {
              return (
                <div className="service-category" key={category._id}>
                  <h3>{category.name}</h3>
                  <p className="no-subcategories">
                    No subcategories available for this category.
                  </p>
                </div>
              );
            }

            return (
              <div className="service-category" key={category._id}>
                <h3>{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                <div className="checkbox-grid">
                  {categorySubcategories.map((subcategory) => (
                    <div className="checkbox-item" key={subcategory._id}>
                      <input
                        type="checkbox"
                        id={`service-${subcategory._id}`}
                        checked={isSubcategorySelected(
                          category._id,
                          subcategory._id
                        )}
                        onChange={() =>
                          handleServiceChange(category._id, subcategory._id)
                        }
                      />
                      <label htmlFor={`service-${subcategory._id}`}>
                        {subcategory.name}
                        {subcategory.description && (
                          <span className="subcategory-description">
                            {" "}
                            - {subcategory.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {categories.length === 0 && !serviceCategoriesStatus.loading && (
          <div className="no-services-message">
            No service categories available at the moment.
            <button
              type="button"
              onClick={() => {
                dispatch(fetchCategories());
                dispatch(fetchSubcategories());
              }}
              className="retry-button"
            >
              Retry Loading Services
            </button>
          </div>
        )}
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
                className={validationErrors.budgetMin ? "error" : ""}
                required
              />
              {validationErrors.budgetMin && (
                <span className="error-text">{validationErrors.budgetMin}</span>
              )}
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
                className={validationErrors.budgetMax ? "error" : ""}
                required
              />
              {validationErrors.budgetMax && (
                <span className="error-text">{validationErrors.budgetMax}</span>
              )}
            </div>
          </div>
          {validationErrors.budget && (
            <span className="error-text">{validationErrors.budget}</span>
          )}
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
