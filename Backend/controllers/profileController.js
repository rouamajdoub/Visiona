const Architect = require("../models/Architect");
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");
const GlobalOption = require("../models/GlobalOption");
const fs = require("fs");
const path = require("path");

// Helper function to get subscription limits
const getSubscriptionLimits = (subscriptionType) => {
  const limits = {
    none: {
      profileImageUpdates: 0,
      portfolioImages: 0,
      servicesCount: 0,
      canUpdateBio: false,
      canUpdateSocialMedia: false,
      canUpdateWebsite: false,
      canAddCertifications: false,
    },
    Free: {
      profileImageUpdates: 1,
      portfolioImages: 3,
      servicesCount: 2,
      canUpdateBio: true,
      canUpdateSocialMedia: false,
      canUpdateWebsite: false,
      canAddCertifications: false,
    },
    premium: {
      profileImageUpdates: 5,
      portfolioImages: 15,
      servicesCount: 8,
      canUpdateBio: true,
      canUpdateSocialMedia: true,
      canUpdateWebsite: true,
      canAddCertifications: true,
      maxCertifications: 5,
    },
    vip: {
      profileImageUpdates: -1, // unlimited
      portfolioImages: -1, // unlimited
      servicesCount: -1, // unlimited
      canUpdateBio: true,
      canUpdateSocialMedia: true,
      canUpdateWebsite: true,
      canAddCertifications: true,
      maxCertifications: -1, // unlimited
    },
  };

  return limits[subscriptionType] || limits.none;
};

// Helper function to delete old files
const deleteOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get architect profile (for the architect themselves)
exports.getMyProfile = async (req, res) => {
  try {
    const architect = await Architect.findById(req.user._id)
      .populate("services.category", "name description")
      .populate("services.subcategories", "name description")
      .populate("subscription");

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Profil d'architecte non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      data: architect,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
      details: error.message,
    });
  }
};

// Update architect profile
exports.updateProfile = async (req, res) => {
  try {
    const architect = await Architect.findById(req.user._id);

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Profil d'architecte non trouvé",
      });
    }

    // Check if architect is approved
    if (architect.status !== "approved") {
      return res.status(403).json({
        success: false,
        error: "Votre compte doit être approuvé pour modifier le profil",
      });
    }

    const limits = getSubscriptionLimits(architect.subscriptionType);
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      // Profile picture update
      if (req.files.profilePicture && req.files.profilePicture[0]) {
        if (limits.profileImageUpdates === 0) {
          return res.status(403).json({
            success: false,
            error:
              "Votre abonnement ne permet pas de changer la photo de profil",
          });
        }

        // Delete old profile picture
        if (architect.profilePicture) {
          deleteOldFile(architect.profilePicture);
        }

        updateData.profilePicture = req.files.profilePicture[0].path;
      }

      // Company logo update
      if (req.files.companyLogo && req.files.companyLogo[0]) {
        if (limits.profileImageUpdates === 0) {
          return res.status(403).json({
            success: false,
            error:
              "Votre abonnement ne permet pas de changer le logo de l'entreprise",
          });
        }

        // Delete old company logo
        if (architect.companyLogo) {
          deleteOldFile(architect.companyLogo);
        }

        updateData.companyLogo = req.files.companyLogo[0].path;
      }

      // Portfolio images update
      if (req.files.portfolio && req.files.portfolio.length > 0) {
        const currentPortfolioCount = architect.portfolio
          ? architect.portfolio.length
          : 0;
        const newImagesCount = req.files.portfolio.length;
        const totalImages = currentPortfolioCount + newImagesCount;

        if (
          limits.portfolioImages !== -1 &&
          totalImages > limits.portfolioImages
        ) {
          return res.status(403).json({
            success: false,
            error: `Votre abonnement limite le portfolio à ${limits.portfolioImages} images`,
          });
        }

        const newPortfolioImages = req.files.portfolio.map((file) => file.path);
        updateData.portfolio = [
          ...(architect.portfolio || []),
          ...newPortfolioImages,
        ];
      }

      // Certifications update
      if (req.files.certifications && req.files.certifications.length > 0) {
        if (!limits.canAddCertifications) {
          return res.status(403).json({
            success: false,
            error:
              "Votre abonnement ne permet pas d'ajouter des certifications",
          });
        }

        const currentCertCount = architect.certifications
          ? architect.certifications.length
          : 0;
        const newCertCount = req.files.certifications.length;
        const totalCerts = currentCertCount + newCertCount;

        if (
          limits.maxCertifications !== -1 &&
          totalCerts > limits.maxCertifications
        ) {
          return res.status(403).json({
            success: false,
            error: `Votre abonnement limite les certifications à ${limits.maxCertifications}`,
          });
        }

        const newCertifications = req.files.certifications.map(
          (file) => file.path
        );
        updateData.certifications = [
          ...(architect.certifications || []),
          ...newCertifications,
        ];
      }
    }

    // Check subscription limits for various fields
    if (updateData.bio && !limits.canUpdateBio) {
      return res.status(403).json({
        success: false,
        error: "Votre abonnement ne permet pas de modifier la biographie",
      });
    }

    if (updateData.website && !limits.canUpdateWebsite) {
      return res.status(403).json({
        success: false,
        error: "Votre abonnement ne permet pas d'ajouter un site web",
      });
    }

    if (updateData.socialMedia && !limits.canUpdateSocialMedia) {
      return res.status(403).json({
        success: false,
        error: "Votre abonnement ne permet pas d'ajouter les réseaux sociaux",
      });
    }

    // Handle services update
    if (updateData.services && Array.isArray(updateData.services)) {
      if (
        limits.servicesCount !== -1 &&
        updateData.services.length > limits.servicesCount
      ) {
        return res.status(403).json({
          success: false,
          error: `Votre abonnement limite les services à ${limits.servicesCount}`,
        });
      }

      // Validate service categories and subcategories exist
      for (const service of updateData.services) {
        const category = await ServiceCategory.findById(service.category);
        if (!category) {
          return res.status(400).json({
            success: false,
            error: "Catégorie de service invalide",
          });
        }

        if (service.subcategories && service.subcategories.length > 0) {
          for (const subId of service.subcategories) {
            const subcategory = await ServiceSubcategory.findById(subId);
            if (
              !subcategory ||
              subcategory.parentCategory.toString() !== service.category
            ) {
              return res.status(400).json({
                success: false,
                error: "Sous-catégorie de service invalide",
              });
            }
          }
        }
      }
    }

    // Handle software proficiency update (validate against GlobalOptions)
    if (
      updateData.softwareProficiency &&
      Array.isArray(updateData.softwareProficiency)
    ) {
      const softwareOptions = await GlobalOption.find({ type: "software" });
      const validSoftwareNames = softwareOptions.map((opt) => opt.name);

      for (const software of updateData.softwareProficiency) {
        if (!validSoftwareNames.includes(software.name)) {
          return res.status(400).json({
            success: false,
            error: `Logiciel non reconnu: ${software.name}`,
          });
        }
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.status;
    delete updateData.isVerified;
    delete updateData.subscriptionType;
    delete updateData.hasAccess;
    delete updateData.customerId;
    delete updateData.rating;
    delete updateData.reviews;
    delete updateData.clients;
    delete updateData.clientsCount;

    // Update the architect profile
    const updatedArchitect = await Architect.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("services.category", "name description")
      .populate("services.subcategories", "name description");

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedArchitect,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la mise à jour du profil",
      details: error.message,
    });
  }
};

// Get public architect profile (for clients)
exports.getArchitectProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const architect = await Architect.findById(id)
      .select(
        "-patenteFile -cinFile -patenteNumber -documents -authTokens -password"
      )
      .populate("services.category", "name description")
      .populate("services.subcategories", "name description")
      .populate("reviews.client", "prenom nomDeFamille profilePicture");

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Architecte non trouvé",
      });
    }

    if (architect.status !== "approved" || !architect.isActive) {
      return res.status(404).json({
        success: false,
        error: "Architecte non disponible",
      });
    }

    // Increment profile views
    architect.profileViews += 1;
    architect.profileViewsTimestamps.push(new Date());
    await architect.save();

    res.status(200).json({
      success: true,
      data: architect,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération du profil",
      details: error.message,
    });
  }
};

// Get all architects with filtering
exports.getAllArchitects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      specialization,
      specialty,
      minBudget,
      maxBudget,
      rating,
      experienceYears,
      certification,
      services,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter object
    const filter = {
      status: "approved",
      isActive: true,
    };

    if (location) {
      filter.$or = [
        { "education.institution": { $regex: location, $options: "i" } },
        { companyName: { $regex: location, $options: "i" } },
      ];
    }

    if (specialization) {
      filter.specialization = {
        $in: Array.isArray(specialization) ? specialization : [specialization],
      };
    }

    if (specialty) {
      filter.specialty = { $regex: specialty, $options: "i" };
    }

    if (certification) {
      filter.certification = { $regex: certification, $options: "i" };
    }

    if (experienceYears) {
      filter.experienceYears = { $gte: parseInt(experienceYears) };
    }

    if (rating) {
      filter["rating.average"] = { $gte: parseFloat(rating) };
    }

    if (services) {
      const serviceIds = Array.isArray(services) ? services : [services];
      filter["services.category"] = { $in: serviceIds };
    }

    // Handle budget filtering (assuming it's related to service price ranges)
    if (minBudget || maxBudget) {
      const budgetFilter = {};
      if (minBudget) budgetFilter.$gte = parseInt(minBudget);
      if (maxBudget) budgetFilter.$lte = parseInt(maxBudget);
      filter["services.priceRange.min"] = budgetFilter;
    }

    // Handle search
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
        { specialization: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const architects = await Architect.find(filter)
      .select(
        "-patenteFile -cinFile -patenteNumber -documents -authTokens -password"
      )
      .populate("services.category", "name description")
      .populate("services.subcategories", "name description")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Architect.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: architects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des architectes",
      details: error.message,
    });
  }
};

// Get service categories and subcategories
exports.getServiceOptions = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });
    const subcategories = await ServiceSubcategory.find()
      .populate("parentCategory", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        categories,
        subcategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des options de service",
      details: error.message,
    });
  }
};

// Get global options (certifications and software)
exports.getGlobalOptions = async (req, res) => {
  try {
    const { type } = req.query;

    const filter = {};
    if (type && ["certification", "software"].includes(type)) {
      filter.type = type;
    }

    const options = await GlobalOption.find(filter).sort({ type: 1, name: 1 });

    const groupedOptions = {
      certifications: options.filter((opt) => opt.type === "certification"),
      software: options.filter((opt) => opt.type === "software"),
    };

    res.status(200).json({
      success: true,
      data: type ? options : groupedOptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des options globales",
      details: error.message,
    });
  }
};

// Remove portfolio image
exports.removePortfolioImage = async (req, res) => {
  try {
    const { imageIndex } = req.params;
    const architect = await Architect.findById(req.user._id);

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Profil d'architecte non trouvé",
      });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= architect.portfolio.length) {
      return res.status(400).json({
        success: false,
        error: "Index d'image invalide",
      });
    }

    // Delete the file
    const imagePath = architect.portfolio[index];
    deleteOldFile(imagePath);

    // Remove from array
    architect.portfolio.splice(index, 1);
    await architect.save();

    res.status(200).json({
      success: true,
      message: "Image supprimée avec succès",
      data: architect.portfolio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de l'image",
      details: error.message,
    });
  }
};

// Remove certification file
exports.removeCertification = async (req, res) => {
  try {
    const { certIndex } = req.params;
    const architect = await Architect.findById(req.user._id);

    if (!architect) {
      return res.status(404).json({
        success: false,
        error: "Profil d'architecte non trouvé",
      });
    }

    const index = parseInt(certIndex);
    if (index < 0 || index >= architect.certifications.length) {
      return res.status(400).json({
        success: false,
        error: "Index de certification invalide",
      });
    }

    // Delete the file
    const certPath = architect.certifications[index];
    deleteOldFile(certPath);

    // Remove from array
    architect.certifications.splice(index, 1);
    await architect.save();

    res.status(200).json({
      success: true,
      message: "Certification supprimée avec succès",
      data: architect.certifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur lors de la suppression de la certification",
      details: error.message,
    });
  }
};
