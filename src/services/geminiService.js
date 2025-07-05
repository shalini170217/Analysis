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
    // Attempt to generate the poster content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlContent = await response.text();

    // Clean and validate the generated HTML
    htmlContent = cleanAndValidateHTML(htmlContent);
    
    return htmlContent;
  } catch (error) {
    console.error("Poster generation failed:", error);
    return generateFallbackContent(category, trends);
  }
};

// Helper function to clean and validate HTML
function cleanAndValidateHTML(htmlContent) {
  // 1. Remove any markdown code blocks
  htmlContent = htmlContent.replace(/```(html)?/g, '').trim();

  // 2. Fix nested HTML documents
  if ((htmlContent.match(/<!DOCTYPE html>/g) || []).length > 1) {
    const lastDocStart = htmlContent.lastIndexOf('<!DOCTYPE html>');
    htmlContent = htmlContent.slice(lastDocStart);
  }

  // 3. Validate HTML structure
  const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
  
  const errors = [];
  if (!htmlContent.includes('</html>')) errors.push('Missing </html>');
  if (!htmlContent.includes('</body>')) errors.push('Missing </body>');
  if (doc.querySelector('parsererror')) errors.push('Invalid HTML');

  if (errors.length > 0) {
    throw new Error(`HTML validation failed: ${errors.join(', ')}`);
  }

  return htmlContent;
}

// Helper function to generate fallback content
function generateFallbackContent(category, trends) {
  // Create trending items list from chart_attribute data
  const trendingItems = trends.slice(0, 3).map(item => 
    `<li style="
      margin: 10px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4a6baf;
      display: flex;
      justify-content: space-between;
    ">
      <div>
        <strong style="display: block; margin-bottom: 5px; color: #212529;">
          ${item.postTitle}
        </strong>
        <span style="color: #495057;">${item.product}</span>
      </div>
      <div style="
        color: #6c757d; 
        font-size: 0.9em;
        display: flex;
        align-items: center;
      ">
        <span style="margin-right: 5px;">▲</span>
        ${item.upvotes.toLocaleString()}
      </div>
    </li>`
  ).join('');

  // Return complete fallback HTML
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trending ${category}</title>
  <style>
    .trending-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 25px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .cta-button {
      display: inline-block;
      margin-top: 25px;
      padding: 12px 24px;
      background: #4a6baf;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      background: #3a5a8f;
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body style="
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  color: #212529;
  padding: 20px;
  line-height: 1.6;
  margin: 0;
">
  <div class="trending-container">
    <h1 style="
      color: #4a6baf;
      margin-top: 0;
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      gap: 10px;
    ">
      <span>🔥</span>
      <span>Trending ${category} Picks</span>
    </h1>
    
    <p style="margin-bottom: 20px; color: #495057;">
      Based on ${trends.length} community discussions with high engagement
    </p>
    
    <ul style="list-style: none; padding: 0; margin: 0;">
      ${trendingItems}
    </ul>
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 1.1rem; margin-bottom: 20px; color: #212529;">
        Ready to join ${trends.length > 1 ? 'these trends' : 'this trend'}?
      </p>
      <a href="/products?category=${encodeURIComponent(category)}" class="cta-button">
        Shop Now →
      </a>
    </div>
  </div>
</body>
</html>`;
}
// Utility function to clear cache (optional)
export function clearGeminiCache() {
  responseCache.clear();
}