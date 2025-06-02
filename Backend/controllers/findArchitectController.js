const User = require("../models/User");
const Favorite = require("../models/Favorite");
const mongoose = require("mongoose");

/**
 * Get all approved architects with filtering, pagination, and search
 */
exports.getArchitects = async (req, res) => {
  console.log("🚀 getArchitects controller hit!");
  console.log("Query params:", req.query);
  console.log("Request URL:", req.url);
  try {
    const {
      page = 1,
      limit = 12,
      search,
      specialization,
      experienceYears,
      rating,
      location,
      priceRange,
      sortBy = "rating.average",
      sortOrder = "desc",
      services,
      languages,
      projectTypes,
    } = req.query;

    // Build filter query
    const filter = {
      role: "architect",
      status: "approved",
      isActive: true,
    };

    // Search by name, company, or bio
    if (search) {
      filter.$or = [
        { prenom: { $regex: search, $options: "i" } },
        { nomDeFamille: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by specialization
    if (specialization) {
      const specs = Array.isArray(specialization)
        ? specialization
        : [specialization];
      filter.specialization = { $in: specs };
    }

    // Filter by experience years
    if (experienceYears) {
      const [min, max] = experienceYears.split("-").map(Number);
      if (max) {
        filter.experienceYears = { $gte: min, $lte: max };
      } else {
        filter.experienceYears = { $gte: min };
      }
    }

    // Filter by rating
    if (rating) {
      filter["rating.average"] = { $gte: parseFloat(rating) };
    }

    // Filter by location (city or governorate)
    if (location) {
      filter.$or = [
        { ville: { $regex: location, $options: "i" } },
        { gouvernorat: { $regex: location, $options: "i" } },
      ];
    }

    // Filter by services
    if (services) {
      const serviceIds = Array.isArray(services) ? services : [services];
      filter["services.category"] = {
        $in: serviceIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    // Filter by languages
    if (languages) {
      const langs = Array.isArray(languages) ? languages : [languages];
      filter["languages.language"] = { $in: langs };
    }

    // Filter by project types
    if (projectTypes) {
      const types = Array.isArray(projectTypes) ? projectTypes : [projectTypes];
      filter.projectTypes = { $in: types };
    }

    // Aggregation pipeline for complex filtering and sorting
    const pipeline = [
      { $match: filter },

      // Add calculated fields for sorting and filtering
      {
        $addFields: {
          hasPortfolio: {
            $gt: [{ $size: { $ifNull: ["$portfolio", []] } }, 0],
          },
          servicesCount: { $size: { $ifNull: ["$services", []] } },
          reviewsCount: { $size: { $ifNull: ["$reviews", []] } },
        },
      },

      // Price range filtering (if specified)
      ...(priceRange
        ? [
            {
              $match: {
                $or: [
                  {
                    "services.priceRange.min": {
                      $lte: parseInt(priceRange.split("-")[1]) || 999999,
                    },
                  },
                  {
                    "services.priceRange.max": {
                      $gte: parseInt(priceRange.split("-")[0]) || 0,
                    },
                  },
                ],
              },
            },
          ]
        : []),

      // Sort
      {
        $sort: {
          [sortBy]: sortOrder === "desc" ? -1 : 1,
          createdAt: -1, // Secondary sort
        },
      },

      // Pagination
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },

      // Populate references
      {
        $lookup: {
          from: "servicecategories",
          localField: "services.category",
          foreignField: "_id",
          as: "serviceCategories",
        },
      },
      {
        $lookup: {
          from: "servicesubcategories",
          localField: "services.subcategories",
          foreignField: "_id",
          as: "serviceSubcategories",
        },
      },

      // Project only necessary fields for performance
      {
        $project: {
          prenom: 1,
          nomDeFamille: 1,
          email: 1,
          profilePicture: 1,
          companyName: 1,
          companyLogo: 1,
          bio: 1,
          experienceYears: 1,
          specialization: 1,
          specialty: 1,
          rating: 1,
          portfolio: { $slice: ["$portfolio", 6] }, // Limit portfolio images
          ville: 1,
          gouvernorat: 1,
          latitude: 1,
          longitude: 1,
          website: 1,
          socialMedia: 1,
          languages: 1,
          projectTypes: 1,
          services: 1,
          serviceCategories: 1,
          serviceSubcategories: 1,
          stats: 1,
          subscriptionType: 1,
          createdAt: 1,
          hasPortfolio: 1,
          servicesCount: 1,
          reviewsCount: 1,
        },
      },
    ];

    // Execute aggregation
    const architects = await User.aggregate(pipeline);

    // Get total count for pagination
    const totalPipeline = [
      { $match: filter },
      ...(priceRange
        ? [
            {
              $match: {
                $or: [
                  {
                    "services.priceRange.min": {
                      $lte: parseInt(priceRange.split("-")[1]) || 999999,
                    },
                  },
                  {
                    "services.priceRange.max": {
                      $gte: parseInt(priceRange.split("-")[0]) || 0,
                    },
                  },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ];

    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get user's favorites if authenticated
    let favoriteArchitectIds = [];
    if (req.user) {
      const favorites = await Favorite.find({
        user: req.user._id,
        favoriteType: "architect",
      }).select("architect");
      favoriteArchitectIds = favorites.map((fav) => fav.architect.toString());
    }

    // Add isFavorite flag to each architect
    const architectsWithFavorites = architects.map((architect) => ({
      ...architect,
      isFavorite: favoriteArchitectIds.includes(architect._id.toString()),
    }));

    res.status(200).json({
      success: true,
      data: {
        architects: architectsWithFavorites,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
        filters: {
          specializations: await getUniqueSpecializations(),
          locations: await getUniqueLocations(),
          languages: await getUniqueLanguages(),
          projectTypes: await getUniqueProjectTypes(),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching architects:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des architectes",
    });
  }
};

/**
 * Get single architect profile
 */
exports.getArchitectProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const architect = await User.findOne({
      _id: id,
      role: "architect",
      status: "approved",
      isActive: true,
    })
      .populate("services.category", "name description")
      .populate("services.subcategories", "name description")
      .populate("reviews.client", "prenom nomDeFamille profilePicture")
      .select("-password -authTokens -resetPasswordToken -resetPasswordExpire");

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Architecte non trouvé",
      });
    }

    // Increment profile views
    await User.findByIdAndUpdate(id, {
      $inc: { profileViews: 1 },
      $push: { profileViewsTimestamps: new Date() },
    });

    // Check if current user has favorited this architect
    let isFavorite = false;
    if (req.user) {
      const favorite = await Favorite.findOne({
        user: req.user._id,
        architect: id,
        favoriteType: "architect",
      });
      isFavorite = !!favorite;
    }

    res.status(200).json({
      success: true,
      data: {
        architect: {
          ...architect.toObject(),
          isFavorite,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching architect profile:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
    });
  }
};

/**
 * Add architect to favorites
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { architectId } = req.params;
    const { notes } = req.body;

    // Check if architect exists and is approved
    const architect = await User.findOne({
      _id: architectId,
      role: "architect",
      status: "approved",
      isActive: true,
    });

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Architecte non trouvé",
      });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      architect: architectId,
      favoriteType: "architect",
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: "Cet architecte est déjà dans vos favoris",
      });
    }

    // Create favorite
    const favorite = new Favorite({
      user: req.user._id,
      architect: architectId,
      favoriteType: "architect",
      notes: notes || "",
    });

    await favorite.save();

    res.status(201).json({
      success: true,
      message: "Architecte ajouté aux favoris",
      data: { favorite },
    });
  } catch (error) {
    console.error("Error adding to favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'ajout aux favoris",
    });
  }
};

/**
 * Remove architect from favorites
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { architectId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      architect: architectId,
      favoriteType: "architect",
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: "Cet architecte n'est pas dans vos favoris",
      });
    }

    res.status(200).json({
      success: true,
      message: "Architecte retiré des favoris",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression des favoris",
    });
  }
};

/**
 * Get user's favorite architects
 */
exports.getFavoriteArchitects = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const favorites = await Favorite.find({
      user: req.user._id,
      favoriteType: "architect",
    })
      .populate({
        path: "architect",
        match: { status: "approved", isActive: true },
        select:
          "prenom nomDeFamille profilePicture companyName bio rating specialization portfolio ville gouvernorat",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter out favorites where architect was deleted or deactivated
    const validFavorites = favorites.filter((fav) => fav.architect);

    const total = await Favorite.countDocuments({
      user: req.user._id,
      favoriteType: "architect",
    });

    res.status(200).json({
      success: true,
      data: {
        favorites: validFavorites,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching favorite architects:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des favoris",
    });
  }
};

// Helper functions for getting unique filter values
async function getUniqueSpecializations() {
  const result = await User.aggregate([
    { $match: { role: "architect", status: "approved", isActive: true } },
    { $unwind: "$specialization" },
    { $group: { _id: "$specialization" } },
    { $sort: { _id: 1 } },
  ]);
  return result.map((item) => item._id);
}

async function getUniqueLocations() {
  const result = await User.aggregate([
    { $match: { role: "architect", status: "approved", isActive: true } },
    {
      $group: {
        _id: null,
        cities: { $addToSet: "$ville" },
        governorates: { $addToSet: "$gouvernorat" },
      },
    },
  ]);

  if (result.length === 0) return { cities: [], governorates: [] };

  return {
    cities: result[0].cities.filter(Boolean).sort(),
    governorates: result[0].governorates.filter(Boolean).sort(),
  };
}

async function getUniqueLanguages() {
  const result = await User.aggregate([
    { $match: { role: "architect", status: "approved", isActive: true } },
    { $unwind: "$languages" },
    { $group: { _id: "$languages.language" } },
    { $sort: { _id: 1 } },
  ]);
  return result.map((item) => item._id);
}

async function getUniqueProjectTypes() {
  const result = await User.aggregate([
    { $match: { role: "architect", status: "approved", isActive: true } },
    { $unwind: "$projectTypes" },
    { $group: { _id: "$projectTypes" } },
    { $sort: { _id: 1 } },
  ]);
  return result.map((item) => item._id);
}
