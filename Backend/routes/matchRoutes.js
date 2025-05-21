const express = require("express");
const router = express.Router();
const axios = require("axios");
const NeedSheet = require("../models/NeedSheet");
const User = require("../models/User"); // Import User model instead of Architect directly

/**
 * Calculate distance between two points using Haversine formula
 * @param {Array} coords1 [longitude, latitude]
 * @param {Array} coords2 [longitude, latitude]
 * @returns {Number} Distance in kilometers
 */
function calculateDistance(coords1, coords2) {
  if (
    !coords1 ||
    !coords2 ||
    !Array.isArray(coords1) ||
    !Array.isArray(coords2)
  ) {
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

router.post("/match", async (req, res) => {
  try {
    const { needsheetId } = req.body;

    if (!needsheetId) {
      return res.status(400).json({ error: "needsheetId is required" });
    }

    // Get needsheet with client info populated
    const needsheet = await NeedSheet.findById(needsheetId)
      .populate("clientId", "location")
      .lean();

    if (!needsheet || !needsheet.clientId) {
      return res.status(404).json({ error: "Needsheet or client not found" });
    }

    // Find architects (users with role="architect" that are approved)
    const architects = await User.find({
      role: "architect",
      status: "approved",
    }).lean();

    if (architects.length === 0) {
      return res.status(404).json({ error: "No approved architects found" });
    }

    // Calculate distances for all architects if coordinates are available
    if (
      needsheet.clientId.location &&
      needsheet.clientId.location.coordinates
    ) {
      const clientCoordinates = needsheet.clientId.location.coordinates;

      architects.forEach((architect) => {
        if (architect.location && architect.location.coordinates) {
          architect.distanceToClient = calculateDistance(
            clientCoordinates.coordinates,
            architect.location.coordinates.coordinates
          );
        } else {
          architect.distanceToClient = Infinity; // No coordinates available
        }
      });
    }

    const prompt = `
You are an AI assistant that selects the best interior architects based on client needs.

Here is the client's need sheet:
${JSON.stringify(needsheet, null, 2)}

Here is a list of available architects:
${JSON.stringify(architects, null, 2)}

From this data, select the 3 best matching architects. Match based on:
- Style preferences (match architect's specialization with client's style preferences)
- Project type (ensure architect has experience with similar project types)
- Location proximity (give preference to architects who are physically closer to the client - use the distanceToClient value if available)
- Budget compatibility (ensure architect's typical projects align with client's budget)
- Experience and rating (consider years of experience and ratings if available)

Important rules:
1. If distanceToClient is available, prioritize architects within 50km of the client
2. When calculating the match score (0-100), distance should account for 25% of the score
3. Sort results by score in descending order (highest score first)

Return the result in **valid JSON** with the following structure:
{
  "matches": [
    {
      "architectId": "<MongoID>",
      "score": <0-100>,
      "distance": <distance in km if available>,
      "reason": "Explain in 1-2 sentences why this architect is a good fit, including distance if relevant"
    },
    ...
  ]
}
Respond only with valid JSON, no explanations outside the object.
`;

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

    const rawResponse = response.data.response;

    // Extract JSON from generated text (useful if the model adds extraneous text)
    const jsonStart = rawResponse.indexOf("{");
    const jsonEnd = rawResponse.lastIndexOf("}") + 1;
    const jsonString = rawResponse.slice(jsonStart, jsonEnd);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("Failed to parse AI response:", err);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    // Add location information to the response
    if (parsed.matches && Array.isArray(parsed.matches)) {
      const enrichedMatches = await Promise.all(
        parsed.matches.map(async (match) => {
          try {
            const architect = architects.find(
              (a) => a._id.toString() === match.architectId
            );
            if (architect && architect.location) {
              match.location = {
                city: architect.location.city || null,
                region: architect.location.region || null,
              };
            }
            return match;
          } catch (error) {
            console.error(`Error enriching match data: ${error.message}`);
            return match; // Return original match if enrichment fails
          }
        })
      );

      parsed.matches = enrichedMatches;
    }

    res.json({ matches: parsed.matches });
  } catch (error) {
    console.error("Matching error:", error.message);
    res.status(500).json({ error: "AI matching failed. Please try again." });
  }
});

module.exports = router;
