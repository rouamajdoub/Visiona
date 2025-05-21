// services/aiServiceAnalysis.js
const Architect = require("../models/Architect");
const ServiceCategory = require("../models/ServiceCategory");
const ServiceSubcategory = require("../models/ServiceSubcategory");
const axios = require("axios"); // Make sure to install axios: npm install axios

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

/**
 * Client for interacting with Ollama API
 */
class OllamaClient {
  constructor(baseUrl, model) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  /**
   * Generate a completion using Ollama
   * @param {string} prompt - The prompt to send to Ollama
   * @param {Object} options - Additional options for the API call
   * @returns {Promise<string>} - The generated text response
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
        ...options,
      });

      return response.data.response;
    } catch (error) {
      console.error("Error calling Ollama API:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw new Error(`Ollama API error: ${error.message}`);
    }
  }
}

// Initialize Ollama client
const ollamaClient = new OllamaClient(OLLAMA_BASE_URL, OLLAMA_MODEL);

/**
 * Analyzes an architect's services using Ollama Llama3 to generate insights
 *
 * @param {string} architectId - The ID of the architect to analyze
 * @returns {Promise<Object>} - Analysis results
 */
exports.analyzeArchitectServices = async (architectId) => {
  try {
    // Get architect with populated service data
    const architect = await Architect.findById(architectId)
      .populate({
        path: "services.category",
        model: "ServiceCategory",
      })
      .populate({
        path: "services.subcategories",
        model: "ServiceSubcategory",
      });

    if (!architect) {
      throw new Error("Architect not found");
    }

    if (!architect.services || architect.services.length === 0) {
      throw new Error("Architect has no services to analyze");
    }

    // Extract service data for analysis
    const serviceData = architect.services.map((service) => ({
      category: service.category?.name || "Unknown Category",
      subcategories: service.subcategories?.map((sub) => sub.name) || [],
      description: service.description || "",
      portfolioItems:
        service.portfolioItems?.map((item) => ({
          title: item.title,
          description: item.description,
        })) || [],
    }));

    // Format data for the Llama3 prompt
    const formattedData = JSON.stringify(serviceData, null, 2);

    const prompt = `
You are an architectural service analyzer. Please analyze the following architect's services data and provide insights.
Extract key expertise areas, tags, and insights based on the data provided.

Services data:
${formattedData}

Please provide your analysis in JSON format with the following structure:
{
  "primaryExpertise": ["area1", "area2", "area3"],
  "secondaryExpertise": ["area1", "area2", "area3", "area4", "area5"],
  "keywordTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "insights": "Brief textual analysis of the architect's services"
}
`;

    // Call Ollama with Llama3 model
    const rawResponse = await ollamaClient.generateCompletion(prompt, {
      temperature: 0.7,
      max_tokens: 2048,
    });

    let aiAnalysis;

    // Attempt to extract JSON from the response
    try {
      // Look for JSON structure in the response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to using the response as is and parsing manually
        console.warn(
          "Failed to extract JSON from Llama3 response, falling back to parsing"
        );
        aiAnalysis = extractAnalysisFromText(rawResponse, serviceData);
      }
    } catch (jsonError) {
      console.warn(
        "Failed to parse JSON from Llama3 response:",
        jsonError.message
      );
      // Fallback to manual extraction
      aiAnalysis = extractAnalysisFromText(rawResponse, serviceData);
    }

    // Ensure we have all required fields with proper formatting
    const finalAnalysis = {
      primaryExpertise: ensureArray(aiAnalysis.primaryExpertise || []).slice(
        0,
        3
      ),
      secondaryExpertise: ensureArray(
        aiAnalysis.secondaryExpertise || []
      ).slice(0, 5),
      keywordTags: ensureArray(aiAnalysis.keywordTags || []).slice(0, 10),
      insights: aiAnalysis.insights || "Analysis completed successfully",
      confidenceScore: 0.85,
    };

    // Update the architect's serviceAnalysis field
    architect.serviceAnalysis = {
      ...finalAnalysis,
      analysisDate: new Date(),
      analysisVersion: "1.0",
      model: OLLAMA_MODEL,
    };

    await architect.save();

    console.log(
      `AI analysis completed for architect ${architectId} using ${OLLAMA_MODEL}`
    );
    return architect.serviceAnalysis;
  } catch (error) {
    console.error("Error analyzing architect services:", error);
    throw error;
  }
};

/**
 * Helper function to ensure a value is an array
 */
function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

/**
 * Extract analysis from text response when JSON parsing fails
 * This is a fallback method in case Llama3 doesn't provide proper JSON
 */
function extractAnalysisFromText(text, serviceData) {
  // Do our best to extract meaningful data from the text response
  const lines = text.split("\n");

  // Look for specific sections in the response
  const primaryExpertise = extractSection(
    lines,
    "primary expertise",
    "expertise",
    "specialties"
  );
  const secondaryExpertise = extractSection(
    lines,
    "secondary expertise",
    "other areas"
  );
  const keywordTags = extractKeywords(text) || generateKeywordTags(serviceData);

  // Extract insights from the whole text
  const insights = text.length > 500 ? text.substring(0, 500) + "..." : text;

  return {
    primaryExpertise,
    secondaryExpertise,
    keywordTags,
    insights: insights.trim(),
  };
}

/**
 * Helper function to extract a section from text lines
 */
function extractSection(lines, ...sectionKeywords) {
  const results = [];
  let inSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we've found the start of our section
    if (!inSection) {
      if (sectionKeywords.some((keyword) => lowerLine.includes(keyword))) {
        inSection = true;
      }
      continue;
    }

    // If we hit an empty line or a line that seems like a new section header, stop
    if (!line.trim() || line.trim().endsWith(":") || line.startsWith("#")) {
      break;
    }

    // Extract items from the line
    const items = line
      .split(/[,:]/)
      .map((item) => item.trim())
      .filter((item) => item && !item.includes("*") && item.length > 2);

    results.push(...items);

    // Stop if we have enough items
    if (results.length >= 5) break;
  }

  return results.slice(0, 5);
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Simple keyword extraction - look for patterns like "Keywords: x, y, z"
  const keywordMatch = text.match(/keywords?:?\s*([^\n]+)/i);
  if (keywordMatch) {
    return keywordMatch[1]
      .split(/[,.]/)
      .map((k) => k.trim())
      .filter((k) => k && k.length > 1)
      .slice(0, 10);
  }
  return null;
}

/**
 * Fallback function to generate keyword tags from service data
 * Used when the AI response doesn't contain usable keywords
 */
function generateKeywordTags(serviceData) {
  const allText = serviceData
    .flatMap((s) => [
      s.category,
      ...s.subcategories,
      s.description,
      ...s.portfolioItems.flatMap((item) => [item.title, item.description]),
    ])
    .filter(Boolean)
    .join(" ");

  // Simple implementation - extract words and deduplicate
  const words = allText
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 10); // Return top 10 keywords
}

/**
 * Batch process all architects to update their service analysis
 */
exports.batchAnalyzeAllArchitects = async () => {
  try {
    const architects = await Architect.find({
      services: { $exists: true, $ne: [] },
    });
    console.log(
      `Starting batch analysis for ${architects.length} architects using ${OLLAMA_MODEL}`
    );

    let successCount = 0;
    let failureCount = 0;

    for (const architect of architects) {
      try {
        await exports.analyzeArchitectServices(architect._id);
        successCount++;

        // Add a small delay between requests to avoid overwhelming Ollama
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error analyzing architect ${architect._id}:`, error);
        failureCount++;
      }
    }

    return {
      total: architects.length,
      success: successCount,
      failure: failureCount,
      model: OLLAMA_MODEL,
    };
  } catch (error) {
    console.error("Error in batch analysis:", error);
    throw error;
  }
};
