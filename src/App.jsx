import { useState, useEffect } from 'react';
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./dashboard";
import { getLatestPoster } from "./services/supabaseService";

export default function App() {
  return (
    <div className="app-container">
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">Home</Link>
      <Link to="/dashboard" className="nav-link">Dashboard</Link>
    </nav>
  );
}

function HomePage() {
  const [poster, setPoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const latestPoster = await getLatestPoster();
        console.log("✅ Poster fetched from Supabase:", latestPoster);
        setPoster(latestPoster);
      } catch (err) {
        setError(err.message);
        console.error("❌ Error fetching poster:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoster();
  }, []);

  const renderPosterContent = () => {
    console.log("📦 Poster raw content:", poster?.content);

    if (!poster?.content?.trim()) {
      return (
        <div style={{ color: "#999" }}>
          ⚠️ Poster is empty or not generated yet.
        </div>
      );
    }

    return (
      <div 
        className="poster-content-wrapper"
        dangerouslySetInnerHTML={{ __html: poster.content }}
      />
    );
  };

  if (loading) return <div className="loading-container">Loading poster...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!poster) return <div className="empty-container">No poster available. Create one from the dashboard.</div>;

  return (
    <div className="poster-container">
      <h1>{poster.category} Trends</h1>
      <div className="poster-meta">
        Last updated: {new Date(poster.updated_at).toLocaleString()}
      </div>
      {renderPosterContent()}
    </div>
  );
}
const styles = `
 html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    display: block;
  }

  body {
    font-family: sans-serif;
    background: #f9fafb;
    color: #111827;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .navbar {
    padding: 1rem;
    background: #3b82f6;
    display: flex;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .nav-link {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .nav-link:hover {
    background-color: rgba(255,255,255,0.2);
  }

  .poster-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 20px;
  }

  .poster-meta {
    color: #6b7280;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .poster-content-wrapper {
    margin-top: 20px;
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
    background: white;
  }

  .poster-content-wrapper img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  .poster-content-wrapper h1,
  .poster-content-wrapper h2,
  .poster-content-wrapper h3 {
    color: #333;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  .poster-content-wrapper p {
    color: #555;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .loading-container,
  .error-container,
  .empty-container {
    text-align: center;
    padding: 2rem;
    font-size: 1.1rem;
    color: #777;
  }
`;

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);
