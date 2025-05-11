// routes/analysis.js
const express = require("express");
const router = express.Router();
const aiServiceAnalysis = require("../utils/aiServiceAnalysis");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

// Route to analyze services for a specific architect
router.post("/architects/:id/analyze", protect, async (req, res) => {
  try {
    const architectId = req.params.id;
    const analysis = await aiServiceAnalysis.analyzeArchitectServices(
      architectId
    );
    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error in analysis route:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Admin route to batch analyze all architects
router.post(
  "/architects/batch-analyze",
  protect,
  restrictTo("admin"),
  async (req, res) => {
    try {
      const result = await aiServiceAnalysis.batchAnalyzeAllArchitects();
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in batch analysis route:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// Get analysis results for an architect (if already analyzed)
router.get("/architects/:id/analysis", protect, async (req, res) => {
  try {
    const Architect = require("../models/Architect");
    const architect = await Architect.findById(req.params.id).select(
      "serviceAnalysis"
    );

    if (!architect) {
      return res.status(404).json({
        success: false,
        message: "Architect not found",
      });
    }

    if (!architect.serviceAnalysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis available for this architect",
      });
    }

    res.json({
      success: true,
      data: architect.serviceAnalysis,
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
