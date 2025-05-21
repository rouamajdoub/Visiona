/**
 * Utility to analyze reviews using Ollama with Llama3 model
 * Detects potential issues like fake or inappropriate reviews
 */
const axios = require("axios");

/**
 * Simple rule-based review analysis when AI is unavailable
 * @param {Object} review - The review object containing rating and comment
 * @returns {String} - Analysis result
 */
const fallbackAnalysis = (review) => {
  const comment = review.comment.toLowerCase();
  const rating = review.rating;

  // Check for obvious spam patterns
  if (
    comment.includes("buy now") ||
    comment.includes("discount") ||
    comment.includes("amazing deals") ||
    comment.includes("www.") ||
    comment.includes("http") ||
    comment.includes(".com") ||
    comment.includes("code ")
  ) {
    return "suspicious: contains promotional content or external links";
  }

  // Check for very short reviews with extreme ratings
  if ((rating === 1 || rating === 5) && comment.length < 20) {
    return "suspicious: very short review with extreme rating";
  }

  // Check for excessive punctuation or caps (common in fake reviews)
  const exclamationCount = (comment.match(/!/g) || []).length;
  const capsPercentage =
    comment.split("").filter((c) => c >= "A" && c <= "Z").length /
    comment.length;

  if (exclamationCount > 3 || capsPercentage > 0.3) {
    return "suspicious: excessive punctuation or capitalization";
  }

  return "authentic: review appears normal";
};

/**
 * Analyzes a review using the Llama3 model via Ollama
 * @param {Object} review - The review object containing rating and comment
 * @returns {Promise<String>} - AI feedback about the review
 */
const analyzeReview = async (review) => {
  try {
    // Run fallback analysis first
    const fallbackResult = fallbackAnalysis(review);

    // If fallback detects issues, return immediately without calling Ollama
    if (fallbackResult.startsWith("suspicious:")) {
      console.log(
        "Fallback analysis detected suspicious review:",
        fallbackResult
      );
      return fallbackResult;
    }

    // Configure the Ollama API endpoint
    const ollamaEndpoint =
      process.env.OLLAMA_API_URL || "http://localhost:11434/api/generate";

    // Prepare the prompt for Llama3 with stronger emphasis on suspicious patterns
    const prompt = `
      You are a review quality analyzer with expertise in detecting fake, spam, and promotional reviews.
      
      Review Rating: ${review.rating}/5
      Review Comment: "${review.comment}"
      
      Your job is to determine if this is a legitimate review or a suspicious one.
      
      RED FLAGS - Check carefully for these suspicious patterns:
      1. SPAM: Contains promotional language, external links, discount codes, or calls to action
      2. INAPPROPRIATE: Has offensive content, threats, or personal attacks
      3. VAGUE: Lacks specific details about what's being reviewed
      4. EXTREME: Very short review with extreme rating (1 or 5 stars)
      5. SEO-FOCUSED: Excessive use of keywords or unnatural language patterns
      6. INCONSISTENT: Mismatch between rating and comment tone
      7. SUSPICIOUS: Excessive punctuation, all caps, or unusual formatting
      
      RESPOND ONLY with one of these exact formats:
      - "authentic: [brief reason]" if the review seems legitimate
      - "suspicious: [specific reason]" if ANY red flags are detected
      
      If you detect ANY suspicious patterns, you MUST classify it as suspicious.
    `;

    // Set a timeout for the API request
    const timeoutMs = 5000; // 5 seconds timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Make request to Ollama API with timeout
    const response = await axios.post(
      ollamaEndpoint,
      {
        model: "llama3",
        prompt,
        stream: false,
      },
      {
        signal: controller.signal,
      }
    );

    // Clear the timeout
    clearTimeout(timeoutId);

    // Extract the AI's assessment
    const aiFeedback = response.data.response.trim();

    // Handle case where AI doesn't follow the format
    if (
      !aiFeedback.startsWith("authentic:") &&
      !aiFeedback.startsWith("suspicious:")
    ) {
      console.log("AI response in incorrect format, using fallback analysis");
      return fallbackResult;
    }

    return aiFeedback;
  } catch (error) {
    console.error("Error analyzing review with AI:", error.message);

    // Use our fallback analysis if AI fails
    return fallbackAnalysis(review);
  }
};

module.exports = { analyzeReview };
