import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBbHukH69CZdhBYOG69cOvcn8hnafbR74k"; // Still recommend using env vars
const CACHE_DURATION = 30 * 60 * 1000; // 30 minute cache

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash", // Cheaper model (1/5th the cost)
  generationConfig: {
    maxOutputTokens: 150, // More concise output
    temperature: 0.2 // Less randomness = fewer tokens
  }
});

// Simple memory cache
const responseCache = new Map();

export async function analyzeRedditPosts(posts) {
  if (!posts?.length) return "⚠️ No posts to analyze";

  // Create cache key from post IDs
  const cacheKey = posts.map(p => p.id).join('-');
  
  // Return cached response if available
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.response;
    }
  }

  try {
    // Extract keywords instead of full titles
    const keywords = posts
      .slice(0, 2) // Only 2 posts now
      .flatMap(p => 
        p.title
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 5) // Max 5 keywords per title
      )
      .join(", ");

      const prompt = `
You are a retail product analyst.

Based on the following trending keywords from Reddit:
${keywords}

Suggest 3 **retail products** (such as food, clothing, cosmetics, gadgets, etc.) that align with these discussions. 
Each suggestion should be a bullet point (•), include a product name, and stay under 15 words.

Only include **realistic, sellable** items. Do not list vague concepts or services.
`;

    const result = await model.generateContent(prompt);
    const response = "🛒 Suggested Products:\n" + (await result.response).text();
    
    // Cache the response
    responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
    
    return response;
    
  } catch (err) {
    console.error("Gemini Error:", err.message);
    return "⚠️ Service temporarily unavailable. Try again later.";
  }
} // this is working