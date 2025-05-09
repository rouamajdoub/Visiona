const express = require("express");
const router = express.Router();
const axios = require("axios");
const NeedSheet = require("../models/NeedSheet");
const Architect = require("../models/Architect");

router.post("/match", async (req, res) => {
  try {
    const { needsheetId } = req.body;

    if (!needsheetId) {
      return res.status(400).json({ error: "needsheetId is required" });
    }

    const needsheet = await NeedSheet.findById(needsheetId).lean();
    const architects = await Architect.find().lean();

    if (!needsheet || architects.length === 0) {
      return res.status(404).json({ error: "Missing data" });
    }

    const prompt = `
You are an AI assistant that selects the best interior architects based on client needs.

Here is the client's need sheet:
${JSON.stringify(needsheet, null, 2)}

Here is a list of available architects:
${JSON.stringify(architects, null, 2)}

From this data, select the 3 best matching architects. Match based on:
- Style preferences
- Project type
- Location proximity
- Budget compatibility
- Experience and rating

Return the result in **valid JSON** with the following structure:
{
  "matches": [
    {
      "architectId": "<MongoID>",
      "score": <0-100>,
      "reason": "Explain in 1-2 sentences why this architect is a good fit"
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

    // 🔍 Extraire le JSON depuis le texte généré (utile si le modèle ajoute du texte parasite)
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

    res.json({ matches: parsed.matches });
  } catch (error) {
    console.error("Matching error:", error.message);
    res.status(500).json({ error: "AI matching failed. Please try again." });
  }
});

module.exports = router;
