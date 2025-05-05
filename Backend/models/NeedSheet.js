const mongoose = require("mongoose");

const needSheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who submitted the needsheet

  // Step 1: Project Type
  projectTypes: [
    {
      type: String,
      enum: [
        "Renovation",
        "Construction",
        "Interior Arrangement",
        "Extension",
        "Superstructure",
        "Exterior Arrangement",
        "Other",
      ],
    },
  ],

  // Step 2: Property Type
  propertyType: {
    type: String,
    enum: [
      "Apartment",
      "House",
      "Commercial Space",
      "Professional Building",
      "Other",
    ],
  },

  // Step 3: Location
  location: {
    country: String,
    region: String,
    city: String,
    postalCode: String,
  },

  // Step 4: Property Details
  totalSurface: { type: Number }, // m²
  workSurface: { type: Number }, // m²
  ownershipStatus: {
    type: String,
    enum: ["Owner", "Renter", "Representative"],
  },

  // Step 5: Services Needed
  services: [
    {
      type: String,
      enum: [
        // Architectural Design
        "Residential Architecture",
        "Commercial Architecture",
        "Industrial Architecture",
        "Renovation and Adaptive Reuse",
        "Space Programming and Planning",
        "Conceptual/Schematic Design",
        "Design Development",
        "Construction Documentation",
        "Building Code and Code Compliance",

        // Interior Design
        "Client Consultation and Programming",
        "Interior Space Planning",
        "Interior Concept Development",
        "3D Interior Renderings and Visualization",
        "Material and Finish Selection",
        "Lighting and Color Design",
        "Furniture, Fixtures & Equipment (FF&E)",
        "Interior Renovation and Restoration",
        "Interior Project Coordination and Management",

        // Landscape Architecture
        "Site Analysis and Conceptual Landscape Design",
        "Landscape Master Planning",
        "Planting Design",
        "Hardscape Design",
        "Water Feature Design",
        "Sustainability and Environmental Landscape Design",
        "Urban and Streetscape Design",
        "Landscape Construction Documentation and Administration",
        "Landscape Maintenance and Management Planning",

        // Urban Planning
        "Land Use and Zoning Analysis",
        "Site Planning and Subdivision Layout",
        "Zoning Code Preparation",
        "Comprehensive and Master Planning",
        "Urban Design and Redevelopment",
        "Resilience and Sustainability Planning",
        "Community Engagement in Planning",
        "GIS and Urban Data Analysis",

        // Specialized Consulting
        "Sustainability Consulting",
        "Heritage and Historic Preservation",
        "Accessibility Consulting",

        // Project Management and Supervision
        "Project Scheduling and Cost Control",
        "Contract and Tender Management",
        "Construction Supervision",
        "Quality Assurance and Quality Control",
        "Progress Monitoring and Reporting",
        "Safety and Compliance Oversight",
        "Punch List and Project Closeout",

        // Feasibility and Site Analysis
        "Site Inventory and Analysis",
        "Concept Feasibility Studies",
        "Regulatory Feasibility Analysis",
        "Market and Program Studies",
        "Environmental and Impact Assessments",

        // 3D Modeling and BIM
        "3D CAD Modeling",
        "Building Information Modeling (BIM)",
        "3D Renderings and Visualizations",
        "Virtual and Augmented Reality",
        "Laser Scanning and Point-Cloud Services",

        // Permit Drawings and Approvals
        "Permit Drawing Preparation",
        "Regulatory Submissions",
        "Code Compliance Documentation",
        "Official Hearings and Negotiations",
      ],
    },
  ],

  // Step 6: Timeline
  startTime: {
    type: String,
    enum: ["ASAP", "1-3 months", "6 months", "Flexible"],
  },
  deadline: { type: Date }, // optional

  // Step 7: Description
  projectDescription: { type: String, maxlength: 2000 },
  budget: {
    min: Number,
    max: Number,
  },
  // Metadata
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Matched", "In Progress"],
    default: "Pending",
  },
});

module.exports = mongoose.model("NeedSheet", needSheetSchema);
