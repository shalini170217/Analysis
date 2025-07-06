import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { getAllPosters } from './services/supabaseService';
import Dashboard from './dashboard'; // Ensure this component exists
import ProductsAdmin from './products';
export default function App() {
  const [allPosters, setAllPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posters = await getAllPosters();
        setAllPosters(posters);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/products" className='nav-link'>Add Products</Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <div className="home-container">
              {loading ? (
                <div className="loading-container">Loading posters...</div>
              ) : error ? (
                <div className="error-container">Error: {error}</div>
              ) : allPosters.length > 0 ? (
                <div className="posters-slideshow">
                  <div className="marquee-wrapper">
                    <div className="slideshow-container marquee-track">
                      {[...allPosters, ...allPosters].map((p, i) => (
                        <div key={`${p.id}-${i}`} className="poster-slide">
                          <h3>{p.category} Trends</h3>
                          <div
                            className="slide-content"
                            dangerouslySetInnerHTML={{ __html: p.content }}
                          />
                          <div className="slide-footer">
                            <small>{new Date(p.updated_at).toLocaleDateString()}</small>
                            <Link className="view-link">Shop Now</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-container">
                  No posters available. <Link to="/dashboard">Create your first poster</Link>
                </div>
              )}
            </div>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductsAdmin />} />

      </Routes>
    </div>
  );
}
const styles = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f9fafb;
    color: #111827;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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

  .home-container {
    flex: 1;
    padding: 1rem;
  }

  .posters-slideshow {
    width: 100%;
    padding: 2rem 0;
  }

  .marquee-wrapper {
    overflow: hidden;
    width: 100%;
    position: relative;
  }

  .marquee-track {
    display: flex;
    animation: scrollMarquee 60s linear infinite;
    width: max-content;
  }

  @keyframes scrollMarquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .poster-slide {
    flex: 0 0 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 420px;
    overflow: hidden;
    transition: transform 0.2s ease;
    margin-right: 1.5rem;
  }

  .poster-slide:hover {
    transform: translateY(-5px);
  }

  .poster-slide h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #3b82f6;
  }

  .slide-content {
    flex-grow: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .slide-content::-webkit-scrollbar {
    width: 6px;
  }

  .slide-content::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
  }

  .slide-content img {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }

  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .view-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: rgba(59, 130, 246, 0.1);
    transition: all 0.2s ease;
  }

  .view-link:hover {
    background: rgba(59, 130, 246, 0.2);
  }

  .loading-container,
  .error-container,
  .empty-container {
    text-align: center;
    padding: 3rem;
    font-size: 1.1rem;
    color: #64748b;
  }

  .empty-container a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .empty-container a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .poster-slide {
      flex: 0 0 280px;
      height: 380px;
      padding: 1rem;
    }
    
    .home-container {
      padding: 0.5rem;
    }
  }
`;

if (!document.querySelector('style[data-poster-styles]')) {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  styleElement.setAttribute('data-poster-styles', '');
  document.head.appendChild(styleElement);
}
