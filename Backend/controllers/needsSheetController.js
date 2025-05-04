const NeedSheet = require("../models/NeedSheet");

/**
 * Create a new need sheet
 * @route POST /api/needsheets
 * @access Private (Client only)
 */
exports.createNeedSheet = async (req, res) => {
  try {
    // Assign the current user's ID to the needSheet
    req.body.userId = req.user._id;

    const needSheet = new NeedSheet(req.body);
    await needSheet.save();

    res.status(201).json({
      success: true,
      data: needSheet,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Get all need sheets belonging to the current user
 * @route GET /api/needsheets
 * @access Private
 */
exports.getNeedSheets = async (req, res) => {
  try {
    // For clients, get only their own needsheets
    // For architects or admins, they could see more (implement based on your requirements)
    const filter = { userId: req.user._id };

    // If user is admin or architect with appropriate permissions,
    // you might adjust the filter here

    const needSheets = await NeedSheet.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: needSheets.length,
      data: needSheets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Get a single need sheet by ID
 * @route GET /api/needsheets/:id
 * @access Private
 */
exports.getNeedSheetById = async (req, res) => {
  try {
    const needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Fiche de besoins non trouvée",
      });
    }

    // Security check: only allow the owner, architects or admins to view
    if (
      needSheet.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "architect"
    ) {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé à cette fiche de besoins",
      });
    }

    res.status(200).json({
      success: true,
      data: needSheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Update a need sheet
 * @route PUT /api/needsheets/:id
 * @access Private (Owner only)
 */
exports.updateNeedSheet = async (req, res) => {
  try {
    let needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Fiche de besoins non trouvée",
      });
    }

    // Only allow the owner to update their needsheet
    if (needSheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier cette fiche de besoins",
      });
    }

    // Prevent updating userId
    delete req.body.userId;

    // Update the needsheet
    needSheet = await NeedSheet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: needSheet,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }

    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Delete a need sheet
 * @route DELETE /api/needsheets/:id
 * @access Private (Owner or Admin)
 */
exports.deleteNeedSheet = async (req, res) => {
  try {
    const needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Fiche de besoins non trouvée",
      });
    }

    // Allow deletion by owner or admin
    if (
      needSheet.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à supprimer cette fiche de besoins",
      });
    }

    await needSheet.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Update need sheet status
 * @route PATCH /api/needsheets/:id/status
 * @access Private (Admin or Architect with permissions)
 */
exports.updateNeedSheetStatus = async (req, res) => {
  try {
    // Only allow specific status values
    if (!["Pending", "Matched", "In Progress"].includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        error: "Statut invalide",
      });
    }

    let needSheet = await NeedSheet.findById(req.params.id);

    if (!needSheet) {
      return res.status(404).json({
        success: false,
        error: "Fiche de besoins non trouvée",
      });
    }

    // Only admins or assigned architects can update status
    if (req.user.role !== "admin" && req.user.role !== "architect") {
      return res.status(403).json({
        success: false,
        error: "Vous n'êtes pas autorisé à modifier le statut de cette fiche",
      });
    }

    // Update just the status field
    needSheet = await NeedSheet.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: needSheet,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};

/**
 * Get all need sheets for AI matching
 * @route GET /api/needsheets/pending
 * @access Private (Admin or System)
 */
exports.getPendingNeedSheets = async (req, res) => {
  try {
    // Only admins can access all pending needsheets
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé",
      });
    }

    const needSheets = await NeedSheet.find({ status: "Pending" }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      count: needSheets.length,
      data: needSheets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Erreur serveur: " + error.message,
    });
  }
};
