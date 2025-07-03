import { useState, useEffect } from "react";
import { fetchTrendingPosts } from "./services/redditService";
import { analyzeRedditPosts } from "./services/geminiService";

const categories = ["Food", "Dress", "Makeup"];

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [posts, setPosts] = useState([]);
  const [geminiOutput, setGeminiOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchTrendingPosts(selectedCategory);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadPosts();
  }, [selectedCategory]);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      const suggestions = await analyzeRedditPosts(posts);
      setGeminiOutput(suggestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "#3b82f6" }}>🛍️ Retail Trend Dashboard</h1>

      {error && (
        <div style={{ color: "red", margin: "1rem 0" }}>
          {error}
        </div>
      )}

      <div style={{ margin: "1.5rem 0", display: "flex", gap: "10px" }}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedCategory === category ? "#3b82f6" : "#e5e7eb",
              color: selectedCategory === category ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <h2>Trending in: {selectedCategory}</h2>

      {loading && !posts.length ? (
        <p>Loading posts...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {posts.map(post => (
            <li key={post.id} style={{ 
              marginBottom: "1.5rem",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              borderRadius: "4px"
            }}>
              <h3 style={{ marginTop: 0 }}>{post.title}</h3>
              <p>👍 {post.upvotes} upvotes</p>
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#3b82f6" }}
              >
                View Post
              </a>
            </li>
          ))}
        </ul>
      )}

      <button 
        onClick={handleAnalyze} 
        disabled={loading || !posts.length}
        style={{
          marginTop: "1rem",
          padding: "10px 16px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          opacity: loading || !posts.length ? 0.5 : 1
        }}
      >
        {loading ? "Analyzing..." : "🧠 Analyze with Gemini"}
      </button>

      {geminiOutput && (
        <div style={{ 
          marginTop: "1.5rem", 
          background: "#f8fafc", 
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: "4px"
        }}>
          <h3 style={{ marginTop: 0 }}>🛒 Suggested Products:</h3>
          <pre style={{ 
            whiteSpace: "pre-wrap",
            fontFamily: "inherit"
          }}>{geminiOutput}</pre>
        </div>
      )}
    </div>
  );
}