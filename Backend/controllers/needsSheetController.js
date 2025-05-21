// controllers/needSheetController.js
const NeedSheet = require("../models/NeedSheet");
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");
const { getCoordinatesByCityName } = require("../utils/geoHelper");
const axios = require("axios");

/**
 * @desc    Create a new need sheet and automatically match with architects
 * @route   POST /api/needsheets
 * @access  Private - Client only
 */
exports.createNeedSheet = async (req, res) => {
  try {
    // Add the authenticated user's ID to the need sheet
    req.body.userId = req.user._id;

    // Process the location data and get coordinates
    if (req.body.location) {
      let geoCoordinates = null;
      const { city, region } = req.body.location;

      // First try with city if available
      if (city) {
        geoCoordinates = getCoordinatesByCityName(city);
      }

      // If city coordinates not found or no city provided, fallback to region
      if (!geoCoordinates && region) {
        geoCoordinates = getCoordinatesByCityName(region);
      }

      // If coordinates were found, update the location object
      if (geoCoordinates) {
        req.body.location.coordinates = geoCoordinates;
      } else {
        // Default coordinates if nothing is found (Tunis)
        req.body.location.coordinates = {
          type: "Point",
          coordinates: [10.1815, 36.8065],
        };
      }
    }

    // Validate services if provided
    if (req.body.services && req.body.services.length > 0) {
      for (const serviceItem of req.body.services) {
        const { category, subcategories } = serviceItem;

        // Check if the category exists
        const categoryExists = await ServiceCategory.findById(category);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            error: `Service category with ID ${category} does not exist.`,
          });
        }

        // Check if subcategories exist and belong to the category (if provided)
        if (subcategories && subcategories.length > 0) {
          for (const subcatId of subcategories) {
            const subcategoryExists = await ServiceSubcategory.findOne({
              _id: subcatId,
              parentCategory: category,
            });

            if (!subcategoryExists) {
              return res.status(400).json({
                success: false,
                error: `Service subcategory with ID ${subcatId} does not exist or does not belong to the specified category.`,
              });
            }
          }
        }
      }
    }

    const needSheet = new NeedSheet(req.body);
    await needSheet.save();

    // Trigger the matching process automatically
    try {
      // Get the authorization token from the original request
      const authToken = req.headers.authorization;

      // Call the matching API with the new needsheet ID
      const matchingResponse = await axios.post(
        `${process.env.API_URL || "http://localhost:5000"}/api/matching`,
        { needsheetId: needSheet._id },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );

      // Add the matching results to the response
      res.status(201).json({
        success: true,
        data: needSheet,
        matches: matchingResponse.data.data,
        message: "Need sheet created successfully with architect matches",
      });
    } catch (matchError) {
      // If matching fails, still return the successful needSheet creation
      console.error("Matching process failed:", matchError);
      res.status(201).json({
        success: true,
        data: needSheet,
        message:
          "Need sheet created successfully but architect matching failed",
      });
    }
  } catch (error) {
    console.error(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get all need sheets for a user
 * @route   GET /api/needsheets
 * @access  Private - Client only
 */
exports.getUserNeedSheets = async (req, res) => {
  try {
    const needSheets = await NeedSheet.find({ userId: req.user._id })
      .populate({
        path: "services.category",
        model: "ServiceCategory",
      })
      .populate({
        path: "services.subcategories",
        model: "ServiceSubcategory",
      });

    res.status(200).json({
      success: true,
      count: needSheets.length,
      data: needSheets,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Get a single need sheet
 * @route   GET /api/needsheets/:id
 * @access  Private - Client only
 */
exports.getNeedSheet = async (req, res) => {
  try {
    const needSheet = await NeedSheet.findById(req.params.id)
      .populate({
        path: "services.category",
        model: "ServiceCategory",
      })
      .populate({
        path: "services.subcategories",
        model: "ServiceSubcategory",
      });

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Need sheet not found",
      });
    }

    // Check if user owns this need sheet
    if (needSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this need sheet",
      });
    }

    res.status(200).json({
      success: true,
      data: needSheet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Update a need sheet
 * @route   PUT /api/needsheets/:id
 * @access  Private - Client only
 */
exports.updateNeedSheet = async (req, res) => {
  try {
    let needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Need sheet not found",
      });
    }

    // Check if user owns this need sheet
    if (needSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this need sheet",
      });
    }

    // Don't allow changing the userId
    delete req.body.userId;

    // Process the location data and get coordinates if location is being updated
    if (req.body.location) {
      let geoCoordinates = null;
      const { city, region } = req.body.location;

      // First try with city if available
      if (city) {
        geoCoordinates = getCoordinatesByCityName(city);
      }

      // If city coordinates not found or no city provided, fallback to region
      if (!geoCoordinates && region) {
        geoCoordinates = getCoordinatesByCityName(region);
      }

      // If coordinates were found, update the location object
      if (geoCoordinates) {
        req.body.location.coordinates = geoCoordinates;
      } else {
        // Keep existing coordinates if we can't find new ones
        req.body.location.coordinates = needSheet.location.coordinates;
      }
    }

    // Validate services if being updated
    if (req.body.services && req.body.services.length > 0) {
      for (const serviceItem of req.body.services) {
        const { category, subcategories } = serviceItem;

        // Check if the category exists
        const categoryExists = await ServiceCategory.findById(category);
        if (!categoryExists) {
          return res.status(400).json({
            success: false,
            error: `Service category with ID ${category} does not exist.`,
          });
        }

        // Check if subcategories exist and belong to the category (if provided)
        if (subcategories && subcategories.length > 0) {
          for (const subcatId of subcategories) {
            const subcategoryExists = await ServiceSubcategory.findOne({
              _id: subcatId,
              parentCategory: category, // Changed from "category" to "parentCategory"
            });

            if (!subcategoryExists) {
              return res.status(400).json({
                success: false,
                error: `Service subcategory with ID ${subcatId} does not exist or does not belong to the specified category.`,
              });
            }
          }
        }
      }
    }

    needSheet = await NeedSheet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: needSheet,
      message: "Need sheet updated successfully",
    });
  } catch (error) {
    console.error(error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

/**
 * @desc    Delete a need sheet
 * @route   DELETE /api/needsheets/:id
 * @access  Private - Client only
 */
exports.deleteNeedSheet = async (req, res) => {
  try {
    const needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Need sheet not found",
      });
    }

    // Check if user owns this need sheet
    if (needSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this need sheet",
      });
    }

    await NeedSheet.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
      message: "Need sheet deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
// Add this to the end of your needSheetController.js file

/**
 * @desc    Match architects for a specific need sheet
 * @route   GET /api/needsheets/:id/match
 * @access  Private - Client only
 */
exports.matchArchitectsForNeedSheet = async (req, res) => {
  try {
    const needSheetId = req.params.id;

    // First check if the needsheet exists and belongs to the user
    const needSheet = await NeedSheet.findById(needSheetId);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Need sheet not found",
      });
    }

    // Check if user owns this need sheet
    if (needSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this need sheet",
      });
    }

    try {
      // Get the authorization token from the original request
      const authToken = req.headers.authorization;

      // Call the matching API with the needsheet ID
      const matchingResponse = await axios.post(
        `${process.env.API_URL || "http://localhost:5000"}/api/matching`,
        { needsheetId: needSheetId },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );

      // Return the matching results
      res.status(200).json({
        success: true,
        data: matchingResponse.data.data,
        message: "Architect matches found successfully",
      });
    } catch (matchError) {
      console.error("Matching process failed:", matchError);
      res.status(500).json({
        success: false,
        error: "Architect matching failed. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
