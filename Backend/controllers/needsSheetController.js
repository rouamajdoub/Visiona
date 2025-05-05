// controllers/needSheetController.js
const NeedSheet = require("../models/NeedSheet");

/**
 * @desc    Create a new need sheet
 * @route   POST /api/needsheets
 * @access  Private - Client only
 */
exports.createNeedSheet = async (req, res) => {
  try {
    // Add the authenticated user's ID to the need sheet
    req.body.userId = req.user._id;

    const needSheet = new NeedSheet(req.body);
    await needSheet.save();

    res.status(201).json({
      success: true,
      data: needSheet,
      message: "Need sheet created successfully",
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
 * @desc    Get all need sheets for a user
 * @route   GET /api/needsheets
 * @access  Private - Client only
 */
exports.getUserNeedSheets = async (req, res) => {
  try {
    const needSheets = await NeedSheet.find({ userId: req.user._id });

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

    await needSheet.remove();

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
