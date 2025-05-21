// controllers/matchingController.js
const axios = require("axios");
const NeedSheet = require("../models/NeedSheet");
const User = require("../models/User");
const Match = require("../models/Match");

/**
 * Get valid coordinates regardless of structure format
 * @param {Object} location Location object which may contain coordinates
 * @returns {Array|null} [longitude, latitude] or null if invalid
 */
function getValidCoordinates(location) {
  if (!location) return null;

  // Handle both possible coordinate structures
  let coords = null;
  if (location.coordinates) {
    coords = Array.isArray(location.coordinates)
      ? location.coordinates
      : location.coordinates.coordinates || null;
  }

  return Array.isArray(coords) && coords.length === 2 ? coords : null;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {Array} coords1 [longitude, latitude]
 * @param {Array} coords2 [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
function calculateDistance(coords1, coords2) {
  if (!coords1 || !coords2) {
    return Infinity; // Return a large number if coordinates are invalid
  }

  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;

  // Haversine formula
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}

/**
 * Check if an architect provides all required services from needsheet
 * @param {Object} needsheet The client needsheet
 * @param {Object} architect The architect to check
 * @returns {Boolean} true if all services are covered, false otherwise
 */
function providesAllRequiredServices(needsheet, architect) {
  if (
    !needsheet.services ||
    !needsheet.services.length ||
    !architect.services
  ) {
    console.log("Missing services in needsheet or architect");
    return false;
  }

  // Extract required service IDs from needsheet
  const requiredServiceIds = new Set();
  needsheet.services.forEach((service) => {
    if (service.category && service.category._id) {
      requiredServiceIds.add(service.category._id.toString());
      console.log(`Added category ID: ${service.category._id.toString()}`);
    }
    if (service.subcategories && service.subcategories.length) {
      service.subcategories.forEach((sub) => {
        if (sub._id) {
          requiredServiceIds.add(sub._id.toString());
          console.log(`Added subcategory ID: ${sub._id.toString()}`);
        }
      });
    }
  });

  // Check if architect provides all these services
  const architectServiceIds = new Set();
  if (Array.isArray(architect.services)) {
    architect.services.forEach((service) => {
      if (service.category) {
        architectServiceIds.add(service.category.toString());
        console.log(
          `Architect provides category ID: ${service.category.toString()}`
        );
      }
      if (service.subcategories && service.subcategories.length) {
        service.subcategories.forEach((sub) => {
          architectServiceIds.add(sub.toString());
          console.log(`Architect provides subcategory ID: ${sub.toString()}`);
        });
      }
    });
  }

  // Check if all required services are provided
  let allServicesProvided = true;
  for (const requiredId of requiredServiceIds) {
    if (!architectServiceIds.has(requiredId)) {
      console.log(`Missing required service ID: ${requiredId}`);
      allServicesProvided = false;
      break;
    }
  }

  console.log(`All services provided: ${allServicesProvided}`);
  return allServicesProvided;
}

/**
 * Check if architect has availability based on client's timeline
 * @param {Object} needsheet The client needsheet
 * @param {Object} architect The architect to check
 * @returns {Number} Score from 0-100 for timeline compatibility
 */
function calculateTimelineScore(needsheet, architect) {
  if (!needsheet.timeline || !architect.availability) {
    return 50; // Default middle score if information is missing
  }

  // Simple logic - can be expanded based on actual data structure
  const clientTimeline = new Date(
    needsheet.timeline.startDate || needsheet.timeline
  );
  const architectAvailableDate = new Date(
    architect.availability.nextAvailable || architect.availability
  );

  if (
    isNaN(clientTimeline.getTime()) ||
    isNaN(architectAvailableDate.getTime())
  ) {
    return 50; // Invalid dates
  }

  // If architect is available before client needs to start, perfect score
  if (architectAvailableDate <= clientTimeline) {
    return 100;
  }

  // Calculate days difference
  const daysDiff = Math.ceil(
    (architectAvailableDate - clientTimeline) / (1000 * 60 * 60 * 24)
  );

  // Score decreases as delay increases (max 100 days delay = 0 score)
  return Math.max(0, 100 - daysDiff);
}

/**
 * Calculate basic rule-based matching score without LLM
 * @param {Object} needsheet The client needsheet
 * @param {Object} architect The architect to evaluate
 * @returns {Object} Score and breakdown
 */
function calculateRuleBasedScore(needsheet, architect) {
  // Initialize score components
  const scoreComponents = {
    services: 0,
    location: 0,
    budget: 0,
    timeline: 0,
    style: 0,
  };

  // Service match (critical) - 0 or 100
  scoreComponents.services = providesAllRequiredServices(needsheet, architect)
    ? 100
    : 0;

  // Location proximity
  const clientCoords = getValidCoordinates(needsheet.location);
  const architectCoords = getValidCoordinates(architect.location);

  if (clientCoords && architectCoords) {
    const distance = calculateDistance(clientCoords, architectCoords);
    architect.distanceToClient = distance; // Store for later use

    // Score decreases with distance (max 200km = 0 score)
    scoreComponents.location = Math.max(0, 100 - distance / 2);
  } else if (
    needsheet.location?.region &&
    architect.location?.region &&
    needsheet.location.region === architect.location.region
  ) {
    // If no coordinates but same region
    scoreComponents.location = 70;
  }

  // Budget compatibility
  if (needsheet.budget && architect.typicalBudget) {
    const clientBudget =
      typeof needsheet.budget === "number"
        ? needsheet.budget
        : needsheet.budget.amount || 0;

    const architectMinBudget =
      typeof architect.typicalBudget === "number"
        ? architect.typicalBudget
        : architect.typicalBudget.min || 0;

    // If architect's minimum budget is within 20% of client's budget (either way)
    const ratio = clientBudget / architectMinBudget;
    if (ratio >= 0.8 && ratio <= 1.2) {
      scoreComponents.budget = 100;
    } else if (ratio >= 0.5 && ratio <= 1.5) {
      scoreComponents.budget = 70;
    } else if (ratio > 0) {
      scoreComponents.budget = 30;
    }
  }

  // Timeline compatibility
  scoreComponents.timeline = calculateTimelineScore(needsheet, architect);

  // Style match (basic)
  if (needsheet.stylePreferences && architect.specialization) {
    const clientStyles = Array.isArray(needsheet.stylePreferences)
      ? needsheet.stylePreferences
      : [needsheet.stylePreferences];

    const architectStyles = Array.isArray(architect.specialization)
      ? architect.specialization
      : [architect.specialization];

    // Check for any matching styles
    const matches = clientStyles.filter((style) =>
      architectStyles.some(
        (archStyle) =>
          archStyle.toLowerCase().includes(style.toLowerCase()) ||
          style.toLowerCase().includes(archStyle.toLowerCase())
      )
    );

    scoreComponents.style =
      matches.length > 0 ? (matches.length / clientStyles.length) * 100 : 0;
  }

  // Calculate weighted total score
  const weights = {
    services: 0.3, // Service match is critical
    location: 0.2, // Location is important
    budget: 0.2, // Budget fit is important
    timeline: 0.15, // Timeline matters
    style: 0.15, // Style preference
  };

  let totalScore = 0;
  for (const [component, score] of Object.entries(scoreComponents)) {
    totalScore += score * weights[component];
  }

  return {
    score: Math.round(totalScore),
    components: scoreComponents,
    distance: architect.distanceToClient,
  };
}

/**
 * Generate matches using rule-based approach
 * @param {Object} needsheet The client needsheet
 * @param {Array} architects List of architects
 * @returns {Array} Matching architects with scores and reasons
 */
function generateRuleBasedMatches(needsheet, architects) {
  // Calculate rule-based scores for all architects
  const scoredArchitects = architects.map((architect) => {
    const scoring = calculateRuleBasedScore(needsheet, architect);

    // Generate a reason for the match
    let reason = "Match based on ";
    const highScores = [];

    if (scoring.components.services >= 90) highScores.push("service coverage");
    if (scoring.components.location >= 80)
      highScores.push("location proximity");
    if (scoring.components.budget >= 80)
      highScores.push("budget compatibility");
    if (scoring.components.timeline >= 80)
      highScores.push("availability timeline");
    if (scoring.components.style >= 80) highScores.push("style preferences");

    reason +=
      highScores.length > 0 ? highScores.join(", ") : "overall compatibility";

    if (scoring.distance && scoring.distance !== Infinity) {
      reason += `. Located ${Math.round(
        scoring.distance
      )}km from project site.`;
    }

    return {
      architectId: architect._id.toString(),
      score: scoring.score,
      distance:
        scoring.distance !== Infinity ? Math.round(scoring.distance) : null,
      reason: reason,
    };
  });

  // Sort by score descending
  return scoredArchitects.sort((a, b) => b.score - a.score);
}

/**
 * Check if the architect has reached their match limit based on subscription
 * @param {Object} architect The architect to check
 * @returns {Boolean} true if architect has reached limit, false otherwise
 */
async function hasReachedMatchLimit(architect) {
  // For free tier architects, check if they already have a match
  if (architect.subscriptionTier === "free") {
    // Count how many active matches this architect has
    const activeMatches = await Match.countDocuments({
      matches: {
        $elemMatch: {
          architectId: architect._id,
          status: {
            $in: [
              "pending",
              "accepted_by_client",
              "accepted_by_architect",
              "fully_accepted",
            ],
          },
        },
      },
    });

    return activeMatches >= 1; // Free tier can only have 1 client at a time
  }

  return false; // Paid tiers have no limit
}

/**
 * Prepare project data for the LLM
 * @param {Object} needsheet The client needsheet
 * @param {Array} architects Top architects from rule-based scoring
 * @returns {String} Formatted project data for the LLM
 */
function prepareProjectDataForLLM(needsheet, architects) {
  // Format client requirements
  const clientRequirements = {
    projectType: needsheet.projectType || "Not specified",
    budget: needsheet.budget
      ? `$${needsheet.budget.amount || needsheet.budget}`
      : "Not specified",
    location: needsheet.location
      ? needsheet.location.city
        ? `${needsheet.location.city}, ${needsheet.location.region || ""}`
        : needsheet.location.region || "Not specified"
      : "Not specified",
    timeline: needsheet.timeline
      ? needsheet.timeline.startDate
        ? new Date(needsheet.timeline.startDate).toLocaleDateString()
        : "Not specified"
      : "Not specified",
    stylePreferences: Array.isArray(needsheet.stylePreferences)
      ? needsheet.stylePreferences.join(", ")
      : needsheet.stylePreferences || "Not specified",
    services:
      needsheet.services && needsheet.services.length
        ? needsheet.services
            .map(
              (service) =>
                `${service.category ? service.category.name : ""}${
                  service.subcategories && service.subcategories.length
                    ? ` (${service.subcategories
                        .map((sub) => sub.name)
                        .join(", ")})`
                    : ""
                }`
            )
            .join("; ")
        : "Not specified",
    projectDescription: needsheet.description || "Not specified",
  };

  // Format architect information (top architects only)
  const architectInfo = architects
    .map((arch, index) => {
      const architect = {
        id: arch.architectId,
        name: `Architect ${index + 1}`,
        score: arch.score,
        specialization: arch.architect.specialization
          ? Array.isArray(arch.architect.specialization)
            ? arch.architect.specialization.join(", ")
            : arch.architect.specialization
          : "Not specified",
        experience: arch.architect.experience || "Not specified",
        portfolio: arch.architect.portfolio ? "Has portfolio" : "No portfolio",
        distance: arch.distance ? `${arch.distance}km` : "Unknown",
        typicalBudget: arch.architect.typicalBudget
          ? `$${
              arch.architect.typicalBudget.min || arch.architect.typicalBudget
            }-$${
              arch.architect.typicalBudget.max || arch.architect.typicalBudget
            }`
          : "Not specified",
      };
      return `Architect ${index + 1}: ${JSON.stringify(architect, null, 2)}`;
    })
    .join("\n\n");

  // Construct the full prompt
  return `
I need you to analyze a construction/architecture project and recommend the best architects for the client based on compatibility.

CLIENT PROJECT DETAILS:
${JSON.stringify(clientRequirements, null, 2)}

TOP ARCHITECT CANDIDATES (already pre-filtered by basic criteria):
${architectInfo}

Based on the project requirements and architect qualifications, please:
1. Identify the top 3 architects that would be the best match for this project
2. For each architect, provide a score (0-100) based on compatibility
3. For each architect, provide a brief explanation (1-2 sentences) of why they are a good match
4. Return your answer in this JSON format:
{
  "matches": [
    {
      "architectId": "architect1_id",
      "score": 92,
      "reason": "Clear explanation of why this architect is a good match"
    },
    ...
  ]
}
  `;
}

/**
 * Get AI-powered matches using the LLM
 * @param {Object} needsheet The client needsheet
 * @param {Array} topArchitects Top architects from rule-based scoring
 * @returns {Array|null} AI-powered matches or null if failed
 */
async function getAIMatches(needsheet, topArchitects) {
  try {
    // Prepare data for LLM
    const prompt = prepareProjectDataForLLM(needsheet, topArchitects);

    // Call Llama3 model (running on localhost)
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        prompt: prompt,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 3 minutes max
      }
    );

    // Extract and parse the response
    if (response.data && response.data.response) {
      const llmResponse = response.data.response;

      // Extract JSON from the response (handle potential non-JSON text)
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const result = JSON.parse(jsonStr);

        if (result.matches && Array.isArray(result.matches)) {
          // Ensure we have the required fields
          const validMatches = result.matches.filter(
            (match) => match.architectId && match.score && match.reason
          );

          if (validMatches.length > 0) {
            return validMatches.slice(0, 3); // Return top 3 matches
          }
        }
      }
    }

    console.log(
      "LLM response parsing failed, falling back to rule-based matching"
    );
    return null;
  } catch (error) {
    console.error("AI matching error:", error.message);
    return null;
  }
}

/**
 * @desc    Match a needsheet with architects
 * @route   POST /api/matching
 * @access  Private - Client only
 */
exports.matchNeedSheet = async (req, res) => {
  try {
    const { needsheetId } = req.body;

    if (!needsheetId) {
      return res.status(400).json({
        success: false,
        error: "needsheetId is required",
      });
    }

    // Get needsheet with service categories and subcategories populated
    const needsheet = await NeedSheet.findById(needsheetId)
      .populate({
        path: "services.category",
        model: "ServiceCategory",
      })
      .populate({
        path: "services.subcategories",
        model: "ServiceSubcategory",
      })
      .lean();

    if (!needsheet) {
      return res.status(404).json({
        success: false,
        error: "Needsheet not found",
      });
    }

    // Ensure the user owns this needsheet
    if (needsheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this need sheet",
      });
    }

    // Find architects (users with role="architect" that are approved)
    const allArchitects = await User.find({
      role: "architect",
      status: "approved",
    }).lean();

    if (allArchitects.length === 0) {
      // Create empty Match document
      await Match.findOneAndUpdate(
        { needsheetId },
        { needsheetId, matches: [] },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        data: [],
        message: "No approved architects found in the system",
      });
    }

    // CRITICAL PRE-FILTERING: Must provide ALL required services
    const serviceMatchingArchitects = allArchitects.filter((architect) =>
      providesAllRequiredServices(needsheet, architect)
    );

    if (serviceMatchingArchitects.length === 0) {
      // Create empty Match document
      await Match.findOneAndUpdate(
        { needsheetId },
        { needsheetId, matches: [] },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        data: [],
        message: "No architects found that provide all required services",
      });
    }

    // Filter out architects who have reached their match limit (for free tier)
    const availableArchitects = [];
    for (const architect of serviceMatchingArchitects) {
      const hasReachedLimit = await hasReachedMatchLimit(architect);
      if (!hasReachedLimit) {
        availableArchitects.push(architect);
      }
    }

    if (availableArchitects.length === 0) {
      // Create empty Match document
      await Match.findOneAndUpdate(
        { needsheetId },
        { needsheetId, matches: [] },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        success: true,
        data: [],
        message: "All matching architects have reached their client limit",
      });
    }

    // STEP 1: Calculate rule-based scores
    const ruleBasedMatches = generateRuleBasedMatches(
      needsheet,
      availableArchitects
    );

    // Add architect information to matches for LLM processing
    const topArchitectsForLLM = ruleBasedMatches.slice(0, 10).map((match) => {
      return {
        ...match,
        architect: availableArchitects.find(
          (arch) => arch._id.toString() === match.architectId
        ),
      };
    });

    // STEP 2: Try to get AI-powered matches
    let finalMatches;
    try {
      const aiMatches = await getAIMatches(needsheet, topArchitectsForLLM);

      if (aiMatches && aiMatches.length > 0) {
        console.log("Using AI-powered matches");
        finalMatches = aiMatches;
      } else {
        // Fallback to rule-based matching
        console.log("Falling back to rule-based matches");
        finalMatches = ruleBasedMatches.slice(0, 3);
      }
    } catch (error) {
      console.error("AI matching error:", error.message);
      // Fallback to rule-based matching
      console.log("Falling back to rule-based matches due to error");
      finalMatches = ruleBasedMatches.slice(0, 3);
    }

    // STEP 3: Save matches to the database
    const matchesWithDefaults = finalMatches.map((match) => ({
      architectId: match.architectId,
      score: match.score,
      reason: match.reason,
      status: "pending",
      approval: {
        client: false,
        architect: false,
      },
    }));

    // Create or update Match document
    const savedMatch = await Match.findOneAndUpdate(
      { needsheetId },
      {
        needsheetId,
        matches: matchesWithDefaults,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Also update the needsheet with matching results reference
    await NeedSheet.findByIdAndUpdate(needsheetId, {
      $set: {
        matchingResults: {
          matchId: savedMatch._id,
          generatedAt: new Date(),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: savedMatch,
    });
  } catch (error) {
    console.error("Matching error:", error.message);
    res.status(500).json({
      success: false,
      error: "Matching failed. Please try again.",
    });
  }
};

/**
 * @desc    Update match status by client
 * @route   PUT /api/matching/:needsheetId/client-status
 * @access  Private - Client only
 */
exports.updateClientMatchStatus = async (req, res) => {
  try {
    const { needsheetId } = req.params;
    const { architectId, approve } = req.body;

    if (!architectId) {
      return res.status(400).json({
        success: false,
        error: "architectId is required",
      });
    }

    // Find the needsheet
    const needsheet = await NeedSheet.findById(needsheetId);
    if (!needsheet) {
      return res.status(404).json({
        success: false,
        error: "Needsheet not found",
      });
    }

    // Ensure the user owns this needsheet
    if (needsheet.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this need sheet",
      });
    }

    // Find the match document
    const matchDoc = await Match.findOne({ needsheetId });
    if (!matchDoc) {
      return res.status(404).json({
        success: false,
        error: "Match not found for this needsheet",
      });
    }

    // Find this architect in the matches
    const matchIndex = matchDoc.matches.findIndex(
      (match) => match.architectId.toString() === architectId
    );

    if (matchIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Architect not found in matches",
      });
    }

    // Update client approval
    matchDoc.matches[matchIndex].approval.client = approve;

    // Update status based on both approvals
    const architectApproval = matchDoc.matches[matchIndex].approval.architect;

    if (approve) {
      if (architectApproval) {
        matchDoc.matches[matchIndex].status = "fully_accepted";
      } else {
        matchDoc.matches[matchIndex].status = "accepted_by_client";
      }
    } else {
      matchDoc.matches[matchIndex].status = "rejected";
    }

    await matchDoc.save();

    res.status(200).json({
      success: true,
      data: {
        needsheetId,
        architectId,
        status: matchDoc.matches[matchIndex].status,
      },
    });
  } catch (error) {
    console.error("Update client match status error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to update match status",
    });
  }
};

/**
 * @desc    Update architect match status (accept/reject)
 * @route   PUT /api/matching/:needsheetId/architect-status
 * @access  Private - Architect only
 */
exports.updateArchitectMatchStatus = async (req, res) => {
  try {
    const { needsheetId } = req.params;
    const { approve } = req.body;

    // Find the match document
    const matchDoc = await Match.findOne({ needsheetId });
    if (!matchDoc) {
      return res.status(404).json({
        success: false,
        error: "Match not found for this needsheet",
      });
    }

    // Find this architect in the matches
    const architectId = req.user._id.toString();
    const matchIndex = matchDoc.matches.findIndex(
      (match) => match.architectId.toString() === architectId
    );

    if (matchIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "You are not matched with this project",
      });
    }

    // Check if architect is on free tier and already has an accepted match
    if (approve && req.user.subscriptionTier === "free") {
      const existingAcceptedMatches = await Match.countDocuments({
        matches: {
          $elemMatch: {
            architectId: req.user._id,
            status: { $in: ["accepted_by_architect", "fully_accepted"] },
          },
        },
      });

      if (existingAcceptedMatches >= 1) {
        return res.status(403).json({
          success: false,
          error:
            "Free tier architects can only accept one client at a time. Please upgrade your subscription to accept more.",
        });
      }
    }

    // Update architect approval
    matchDoc.matches[matchIndex].approval.architect = approve;
    matchDoc.matches[matchIndex].responseDate = new Date();

    // Update status based on both approvals
    const clientApproval = matchDoc.matches[matchIndex].approval.client;

    if (approve) {
      if (clientApproval) {
        matchDoc.matches[matchIndex].status = "fully_accepted";
      } else {
        matchDoc.matches[matchIndex].status = "accepted_by_architect";
      }
    } else {
      matchDoc.matches[matchIndex].status = "rejected";
    }

    await matchDoc.save();

    res.status(200).json({
      success: true,
      data: {
        needsheetId,
        architectId,
        status: matchDoc.matches[matchIndex].status,
      },
    });
  } catch (error) {
    console.error("Update architect match status error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to update match status",
    });
  }
};

/**
 * @desc    Refresh matches for a needsheet
 * @route   POST /api/matching/:needsheetId/refresh
 * @access  Private - Client only
 */
exports.refreshMatches = async (req, res) => {
  try {
    const { needsheetId } = req.params;

    // Simply call the matchNeedSheet with the needsheetId
    req.body.needsheetId = needsheetId;
    return exports.matchNeedSheet(req, res);
  } catch (error) {
    console.error("Refresh matches error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to refresh matches",
    });
  }
};
/**
 * @desc    Get matches for a needsheet
 * @route   GET /api/matching/:needsheetId
 * @access  Private - Client & matched architects
 */
exports.getMatches = async (req, res) => {
  try {
    const { needsheetId } = req.params;

    // Find matches for this needsheet
    const matchDoc = await Match.findOne({ needsheetId }).populate({
      path: "matches.architectId",
      model: "User",
      select: "name email profilePicture specialization location",
    });

    if (!matchDoc) {
      return res.status(404).json({
        success: false,
        error: "No matches found for this needsheet",
      });
    }

    // Find the needsheet
    const needsheet = await NeedSheet.findById(needsheetId);

    // Determine if user is authorized to view these matches
    const isClient =
      req.user.role === "client" &&
      needsheet &&
      needsheet.userId.toString() === req.user._id.toString();

    const isMatchedArchitect =
      req.user.role === "architect" &&
      matchDoc.matches.some(
        (match) => match.architectId._id.toString() === req.user._id.toString()
      );

    // If not authorized, return error
    if (!isClient && !isMatchedArchitect) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view these matches",
      });
    }

    // If user is an architect, only return their own match
    if (isMatchedArchitect) {
      const myMatch = matchDoc.matches.find(
        (match) => match.architectId._id.toString() === req.user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: {
          ...matchDoc.toObject(),
          matches: [myMatch],
        },
        isYourMatch: true,
      });
    }

    // For clients, include information about whether the client has approved each match
    const formattedMatches = matchDoc.matches.map((match) => ({
      ...match.toObject(),
      youApproved: match.approval.client,
      architectApproved: match.approval.architect,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...matchDoc.toObject(),
        matches: formattedMatches,
      },
      isOwner: isClient,
    });
  } catch (error) {
    console.error("Get matches error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve matches",
    });
  }
};
