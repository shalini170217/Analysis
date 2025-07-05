import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBbHukH69CZdhBYOG69cOvcn8hnafbR74k";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 150,
    temperature: 0.2
  }
});

const responseCache = new Map();

export async function analyzeRedditPosts(posts) {
  if (!posts?.length) return { response: "⚠️ No posts to analyze", suggestions: [] };

  const usedPosts = posts.slice(0, 2); // Use top 2 posts
  const cacheKey = usedPosts.map(p => p.id).join('-');

  // Check cache first
  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  const prompt = `
You are a retail product analyst. For each of the following Reddit post titles, 
suggest one specific retail product (food, gadget, clothing, etc.) relevant to that discussion. 
Keep it concise and under 15 words.

Respond using bullet points (•), one per title.

Titles:
${usedPosts.map(p => `- ${p.title}`).join('\n')}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract text from response
    let rawText;
    try {
      rawText = await response.text(); // For newer SDK versions
    } catch {
      // Fallback for different response formats
      rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || 
               "⚠️ Could not extract response text";
    }

    const lines = rawText
      .split("•")
      .map(s => s.trim())
      .filter(Boolean);

    const suggestions = usedPosts.map((post, i) => ({
      product: lines[i] || "❓ No suggestion",
      upvotes: post.upvotes,
      postTitle: post.title
    }));

    const data = {
      response: "🛒 Suggested Products:\n" + rawText,
      suggestions
    };

    // Update cache
    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;

  } catch (err) {
    console.error("Gemini Error:", err);
    return { 
      response: "⚠️ Service temporarily unavailable. Try again later.", 
      suggestions: [] 
    };
  }
}

export const generatePosterContent = async ({ category, analysis, trends }) => {
  const prompt = `
You are an HTML5 generator. Create a SINGLE, COMPLETE HTML document for a ${category} promotional poster.

STRICT RULES:
1. Output ONLY ONE COMPLETE HTML DOCUMENT
2. Must include:
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>${category} Trends</title>
   </head>
   <body>
     <!-- Your content here -->
   </body>
   </html>
3. All CSS must be COMPLETE inline styles (no broken properties)
4. ALL TAGS MUST BE PROPERLY CLOSED
5. No nested HTML documents
6. No markdown/code blocks

Content requirements:
- Vibrant title with emoji
- 3 product cards with trends data: ${JSON.stringify(trends.slice(0, 3))}
- Analysis summary: ${analysis.slice(0, 200)}
- Mobile-responsive layout
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlContent = await response.text();

    // 1. Remove any markdown code blocks
    htmlContent = htmlContent.replace(/```(html)?/g, '').trim();

    // 2. Fix nested HTML documents
    if ((htmlContent.match(/<!DOCTYPE html>/g) || []).length > 1) {
      // Extract just the inner-most complete document
      const lastDocStart = htmlContent.lastIndexOf('<!DOCTYPE html>');
      htmlContent = htmlContent.slice(lastDocStart);
    }

    // 3. Validate HTML structure
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    
    // Check for critical errors
    const errors = [];
    if (!htmlContent.includes('</html>')) errors.push('Missing </html>');
    if (!htmlContent.includes('</body>')) errors.push('Missing </body>');
    if (doc.querySelector('parsererror')) errors.push('Invalid HTML');

    if (errors.length > 0) {
      throw new Error(`HTML validation failed: ${errors.join(', ')}`);
    }

    return htmlContent;
  } catch (error) {
    console.error("Poster generation failed:", error);
    // Return a guaranteed-valid fallback
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${category} Trends</title>
</head>
<body style="
  font-family: sans-serif;
  padding: 20px;
  background: #f9f9f9;
  color: #333;
">
  <h1 style="color: #4a6baf;">${category} Trends</h1>
  <p>⚠️ We couldn't generate the poster. Please try again.</p>
</body>
</html>`;
  }
};
// Utility function to clear cache (optional)
export function clearGeminiCache() {
  responseCache.clear();
}