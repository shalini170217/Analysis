import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBbHukH69CZdhBYOG69cOvcn8hnafbR74k";
const CACHE_DURATION = 30 * 60 * 1000;

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

  if (responseCache.has(cacheKey)) {
    const cached = responseCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
  }

  const prompt = `
You are a retail product analyst.

For each of the following Reddit post titles, suggest **one specific retail product** (food, gadget, clothing, etc.) relevant to that discussion. Keep it concise and under 15 words.

Respond using bullet points (•), one per title.

Titles:
${usedPosts.map(p => `- ${p.title}`).join('\n')}
`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = (await result.response).text();

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

    responseCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;

  } catch (err) {
    console.error("Gemini Error:", err.message);
    return { response: "⚠️ Service temporarily unavailable. Try again later.", suggestions: [] };
  }
}
