// controllers/serviceCategoryController.js
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");

// Create a new service category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await ServiceCategory.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "A category with this name already exists",
      });
    }

    const category = new ServiceCategory({
      name,
      description: description || "",
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Service category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating service category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create service category",
      error: error.message,
    });
  }
};

// Get all service categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching service categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service categories",
      error: error.message,
    });
  }
};

// Get a specific service category with its subcategories
exports.getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    // Get subcategories for this category
    const subcategories = await ServiceSubcategory.find({
      parentCategory: categoryId,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        category,
        subcategories,
      },
    });
  } catch (error) {
    console.error("Error fetching service category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service category",
      error: error.message,
    });
  }
};

// Update a service category
exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    if (name) {
      // Check if the new name already exists for another category
      const existingCategory = await ServiceCategory.findOne({
        name,
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "A category with this name already exists",
        });
      }
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(
      categoryId,
      {
        name,
        description,
      },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating service category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service category",
      error: error.message,
    });
  }
};

// Delete a service category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // First check if category exists
    const category = await ServiceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Service category not found",
      });
    }

    // Delete all subcategories associated with this category
    const deleteSubcategoriesResult = await ServiceSubcategory.deleteMany({
      parentCategory: categoryId,
    });

    // Now delete the category
    const deletedCategory = await ServiceCategory.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message:
        "Service category and all associated subcategories deleted successfully",
      deletedSubcategories: deleteSubcategoriesResult.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting service category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service category",
      error: error.message,
    });
  }
};
