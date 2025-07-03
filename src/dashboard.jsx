import { useState, useEffect } from "react";
import { fetchTrendingPosts } from "./services/redditService";
import { analyzeRedditPosts } from "./services/geminiService";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [categoryInput, setCategoryInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [posts, setPosts] = useState([]);
  const [geminiOutput, setGeminiOutput] = useState("");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPosts = async () => {
      if (!selectedCategory.trim()) return;

      try {
        setLoading(true);
        setError("");
        const data = await fetchTrendingPosts(selectedCategory);
        setPosts(data);
      } catch (err) {
        setPosts([]);
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
      const { response, suggestions } = await analyzeRedditPosts(posts);
      setGeminiOutput(response);
      setChartData(suggestions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCategory = (e) => {
    e.preventDefault();
    if (categoryInput.trim()) {
      setSelectedCategory(categoryInput.trim());
      setGeminiOutput("");
      setChartData([]);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "#3b82f6" }}>🛍️ Retail Trend Dashboard</h1>

      <form onSubmit={handleSubmitCategory} style={{ marginBottom: "1.5rem", display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="Enter a category (e.g. snacks, shoes, skincare)"
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </form>

      {selectedCategory && <h2>Trending in: {selectedCategory}</h2>}

      {error && <div style={{ color: "red", margin: "1rem 0" }}>{error}</div>}

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

      {posts.length > 0 && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            marginTop: "1rem",
            padding: "10px 16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? "Analyzing..." : "🧠 Analyze with Gemini"}
        </button>
      )}

      {geminiOutput && (
        <div style={{
          marginTop: "1.5rem",
          background: "#f8fafc",
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: "4px"
        }}>
          <h3 style={{ marginTop: 0 }}>🛒 Suggested Products:</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
            {geminiOutput}
          </pre>
        </div>
      )}

      {chartData.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>🥧 Product Influence by Post Upvotes</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="upvotes"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, upvotes }) => `${name} (${upvotes})`}
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [`${value} upvotes`, props.payload.product]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
