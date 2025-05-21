// controllers/serviceSubcategoryController.js
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");

// Create a new service subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name || !parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and parent category ID are required",
      });
    }

    // Verify parent category exists
    const categoryExists = await ServiceCategory.findById(parentCategory);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    // Check if subcategory with the same name already exists under this parent category
    const existingSubcategory = await ServiceSubcategory.findOne({
      name,
      parentCategory,
    });

    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message:
          "A subcategory with this name already exists under the selected parent category",
      });
    }

    const subcategory = new ServiceSubcategory({
      name,
      description: description || "",
      parentCategory,
    });

    await subcategory.save();

    res.status(201).json({
      success: true,
      message: "Service subcategory created successfully",
      data: subcategory,
    });
  } catch (error) {
    console.error("Error creating service subcategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create service subcategory",
      error: error.message,
    });
  }
};

// Get all service subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;

    let query = {};
    if (categoryId) {
      query.parentCategory = categoryId;
    }

    const subcategories = await ServiceSubcategory.find(query)
      .populate("parentCategory", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching service subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service subcategories",
      error: error.message,
    });
  }
};

// Get a specific service subcategory
exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    const subcategory = await ServiceSubcategory.findById(
      subcategoryId
    ).populate("parentCategory", "name");

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Service subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error("Error fetching service subcategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service subcategory",
      error: error.message,
    });
  }
};

// Update a service subcategory
exports.updateSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;
    const { name, description, parentCategory } = req.body;

    const subcategory = await ServiceSubcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Service subcategory not found",
      });
    }

    // If parent category is being updated, verify it exists
    if (
      parentCategory &&
      parentCategory !== subcategory.parentCategory.toString()
    ) {
      const categoryExists = await ServiceCategory.findById(parentCategory);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    // Check if the new name already exists for another subcategory under the same parent category
    if (name || parentCategory) {
      const targetParentId = parentCategory || subcategory.parentCategory;
      const existingSubcategory = await ServiceSubcategory.findOne({
        name: name || subcategory.name,
        parentCategory: targetParentId,
        _id: { $ne: subcategoryId },
      });

      if (existingSubcategory) {
        return res.status(400).json({
          success: false,
          message:
            "A subcategory with this name already exists under the selected parent category",
        });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (parentCategory) updates.parentCategory = parentCategory;

    const updatedSubcategory = await ServiceSubcategory.findByIdAndUpdate(
      subcategoryId,
      updates,
      { new: true, runValidators: true }
    ).populate("parentCategory", "name");

    res.status(200).json({
      success: true,
      message: "Service subcategory updated successfully",
      data: updatedSubcategory,
    });
  } catch (error) {
    console.error("Error updating service subcategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service subcategory",
      error: error.message,
    });
  }
};

// Delete a service subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    const deletedSubcategory = await ServiceSubcategory.findByIdAndDelete(
      subcategoryId
    );

    if (!deletedSubcategory) {
      return res.status(404).json({
        success: false,
        message: "Service subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service subcategory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service subcategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service subcategory",
      error: error.message,
    });
  }
};
