const GlobalOption = require("../models/GlobalOption");

/**
 * Create a new global option (admin only)
 */
exports.createGlobalOption = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required",
      });
    }

    // Check if the option already exists (using direct query instead of findOne)
    const existingOption = await GlobalOption.findOne({
      name: name,
      type: type,
    }).exec();

    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: "Option already exists with this name and type",
      });
    }

    const globalOption = new GlobalOption({
      name,
      type,
    });

    await globalOption.save();

    res.status(201).json({
      success: true,
      data: globalOption,
    });
  } catch (error) {
    console.error("Error creating global option:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get all global options with filtering and search capabilities
 */
exports.getGlobalOptions = async (req, res) => {
  try {
    const { type, search } = req.query;
    const filter = {};

    // Apply type filter if provided
    if (type) {
      filter.type = type;
    }

    // Apply search filter if provided
    if (search) {
      filter.name = { $regex: `^${search}`, $options: "i" }; // Starts with search term, case insensitive
    }

    const globalOptions = await GlobalOption.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: globalOptions.length,
      data: globalOptions,
    });
  } catch (error) {
    console.error("Error getting global options:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Get a single global option by ID
 */
exports.getGlobalOptionById = async (req, res) => {
  try {
    const globalOption = await GlobalOption.findById(req.params.id);

    if (!globalOption) {
      return res.status(404).json({
        success: false,
        message: "Global option not found",
      });
    }

    res.status(200).json({
      success: true,
      data: globalOption,
    });
  } catch (error) {
    console.error("Error getting global option:", error);
    // Check if error is due to invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Update a global option (admin only)
 */
exports.updateGlobalOption = async (req, res) => {
  try {
    const { name, type } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (type) updateData.type = type;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    // Check if the option would conflict with an existing one after update
    if (name && type) {
      const existingOption = await GlobalOption.findOne({
        _id: { $ne: req.params.id },
        name: name,
        type: type,
      }).exec();

      if (existingOption) {
        return res.status(400).json({
          success: false,
          message: "Another option already exists with this name and type",
        });
      }
    }

    const globalOption = await GlobalOption.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!globalOption) {
      return res.status(404).json({
        success: false,
        message: "Global option not found",
      });
    }

    res.status(200).json({
      success: true,
      data: globalOption,
    });
  } catch (error) {
    console.error("Error updating global option:", error);
    // Check if error is due to invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * Delete a global option (admin only)
 */
exports.deleteGlobalOption = async (req, res) => {
  try {
    const globalOption = await GlobalOption.findByIdAndDelete(req.params.id);

    if (!globalOption) {
      return res.status(404).json({
        success: false,
        message: "Global option not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Global option deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Error deleting global option:", error);
    // Check if error is due to invalid ID format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
