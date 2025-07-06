import { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { getAllPosters, getAllProductsByCategory } from './services/supabaseService';
import { ShoppingCart, Star, Heart, Eye } from 'lucide-react';
import Dashboard from './dashboard';
import ProductsAdmin from './products';

const categories = [
  { label: 'Grocery', table: 'products_grocery', color: '#10b981', icon: '🛒' },
  { label: 'Clothing and Apparel', table: 'products_clothing', color: '#8b5cf6', icon: '👕' },
  { label: 'Health and Beauty', table: 'products_health', color: '#ec4899', icon: '💄' },
  { label: 'Electronics', table: 'products_electronics', color: '#3b82f6', icon: '📱' },
  { label: 'Home and Furniture', table: 'products_home', color: '#f59e0b', icon: '🏠' },
  { label: 'Household Essentials', table: 'products_household', color: '#ef4444', icon: '🧽' },
  { label: 'Toys and Baby', table: 'products_toys', color: '#f472b6', icon: '🧸' },
  { label: 'Sports', table: 'products_sports', color: '#0ea5e9', icon: '⚽' },
  { label: 'Stationery', table: 'products_stationery', color: '#6366f1', icon: '✏️' },
  { label: 'Pets', table: 'products_pets', color: '#16a34a', icon: '🐕' },
  { label: 'Party Supplies', table: 'products_party', color: '#e879f9', icon: '🎉' },
  { label: 'Pharmacy', table: 'products_pharmacy', color: '#60a5fa', icon: '💊' },
];

function ProductCard({ product, categoryColor }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image-container">
        {product.image_url ? (
          <img src={product.image_url} alt={product.productName} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <Eye size={32} color="#9ca3af" />
          </div>
        )}
        <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
          <button 
            className="wishlist-btn"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart 
              size={20} 
              fill={isWishlisted ? '#ef4444' : 'none'} 
              color={isWishlisted ? '#ef4444' : '#ffffff'} 
            />
          </button>
          <button className="quick-view-btn">
            <Eye size={20} color="#ffffff" />
          </button>
        </div>
        {product.stock && product.stock < 10 && (
          <div className="stock-badge">Only {product.stock} left!</div>
        )}
      </div>
      
      <div className="product-info">
        <h4 className="product-title">{product.productName}</h4>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < 4 ? '#fbbf24' : 'none'} 
              color={i < 4 ? '#fbbf24' : '#d1d5db'} 
            />
          ))}
          <span className="rating-text">(4.2)</span>
        </div>

        <div className="product-meta">
          <div className="product-stats">
            <span className="stock-info">Stock: {product.stock ?? 'N/A'}</span>
            <span className="upvotes-info">❤️ {product.upvotes ?? 0}</span>
          </div>
        </div>

        <div className="product-price">
          <span className="current-price">$29.99</span>
          <span className="original-price">$39.99</span>
          <span className="discount-badge">25% OFF</span>
        </div>

        <button 
          className="shop-now-btn"
          style={{ backgroundColor: categoryColor }}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductSection() {
  const [productsByCategory, setProductsByCategory] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const all = {};
      for (const { table, label } of categories) {
        try {
          const products = await getAllProductsByCategory(table);
          all[label] = products;
        } catch (err) {
          all[label] = [];
        }
      }
      setProductsByCategory(all);
    };
    fetchAll();
  }, []);

  return (
    <div className="products-section">
      <div className="section-header">
        <h1 className="section-title">Shop by Category</h1>
        <p className="section-subtitle">Discover amazing products across all categories</p>
      </div>

      {categories.map(({ label, color, icon }) => (
        <div key={label} className="category-section">
          <div className="category-header">
            <div className="category-title-wrapper">
              <span className="category-icon">{icon}</span>
              <h2 className="category-title" style={{ color }}>{label}</h2>
              <span className="product-count">
                ({(productsByCategory[label] || []).length} items)
              </span>
            </div>
            <button className="view-all-btn" style={{ color }}>
              View All →
            </button>
          </div>
          
          <div className="horizontal-scroll">
            {(productsByCategory[label] || []).length > 0 ? (
              (productsByCategory[label] || []).map((product, i) => (
                <ProductCard 
                  key={i} 
                  product={product} 
                  categoryColor={color}
                />
              ))
            ) : (
              <div className="empty-category">
                <div className="empty-icon">{icon}</div>
                <p>No products available in this category</p>
                <button className="add-product-btn">Add Products</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

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
      <nav className="navbar">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/products" className="nav-link">Add Products</Link>
      </nav>

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
                <>
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

                  <ProductSection />
                </>
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
    background: #f8fafc;
    color: #1e293b;
  }

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    gap: 1rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
  }

  .nav-link {
    color: white;
    text-decoration: none;
    font-weight: 600;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .nav-link:hover {
    background-color: rgba(255,255,255,0.2);
    transform: translateY(-2px);
  }

  .home-container {
    flex: 1;
    padding: 0;
  }

  .posters-slideshow {
    width: 100%;
    padding: 2rem 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
    padding: 0 2rem;
  }

  @keyframes scrollMarquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }

  .poster-slide {
    flex: 0 0 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    height: 420px;
    overflow: hidden;
    transition: all 0.3s ease;
    margin-right: 1.5rem;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .poster-slide:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  }

  .poster-slide h3 {
    margin: 0 0 1rem 0;
    font-size: 1.2rem;
    color: #3b82f6;
    font-weight: 700;
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
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .view-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.1);
    transition: all 0.3s ease;
  }

  .view-link:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }

  .products-section {
    padding: 3rem 2rem;
    background: #ffffff;
  }

  .section-header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
  }

  .category-section {
    margin-bottom: 4rem;
    background: #f8fafc;
    border-radius: 20px;
    padding: 2rem;
    border: 1px solid #e2e8f0;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .category-title-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .category-icon {
    font-size: 1.5rem;
    padding: 0.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .category-title {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
  }

  .product-count {
    font-size: 0.9rem;
    color: #64748b;
    background: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 500;
  }

  .view-all-btn {
    background: none;
    border: none;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 8px;
  }

  .view-all-btn:hover {
    background: rgba(0,0,0,0.05);
    transform: translateX(4px);
  }

  .horizontal-scroll {
    display: flex;
    overflow-x: auto;
    gap: 1.5rem;
    padding: 1rem 0;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  .horizontal-scroll::-webkit-scrollbar {
    height: 8px;
  }

  .horizontal-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
  }

  .horizontal-scroll::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #cbd5e1, #94a3b8);
    border-radius: 10px;
  }

  .horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #94a3b8, #64748b);
  }

  .product-card {
    min-width: 280px;
    max-width: 280px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    scroll-snap-align: start;
    border: 1px solid #e2e8f0;
    position: relative;
  }

  .product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
  }

  .product-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
    background: #f8fafc;
  }

  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .product-card:hover .product-image {
    transform: scale(1.05);
  }

  .product-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  }

  .product-overlay {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .product-overlay.visible {
    opacity: 1;
  }

  .wishlist-btn,
  .quick-view-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .wishlist-btn:hover,
  .quick-view-btn:hover {
    background: rgba(0,0,0,0.9);
    transform: scale(1.1);
  }

  .stock-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    background: #ef4444;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .product-info {
    padding: 1.5rem;
  }

  .product-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
  }

  .product-description {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 0 1rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .rating-text {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
  }

  .product-meta {
    margin-bottom: 1rem;
  }

  .product-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .stock-info {
    color: #059669;
    font-weight: 600;
  }

  .upvotes-info {
    color: #dc2626;
    font-weight: 600;
  }

  .product-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .current-price {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1e293b;
  }

  .original-price {
    font-size: 0.9rem;
    color: #94a3b8;
    text-decoration: line-through;
  }

  .discount-badge {
    background: #dcfce7;
    color: #166534;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .shop-now-btn {
    width: 100%;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .shop-now-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  .shop-now-btn:active {
    transform: translateY(0);
  }

  .empty-category {
    min-width: 280px;
    padding: 3rem 2rem;
    text-align: center;
    background: white;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-category p {
    color: #64748b;
    margin-bottom: 1.5rem;
  }

  .add-product-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .add-product-btn:hover {
    background: #e2e8f0;
  }

  .loading-container,
  .error-container,
  .empty-container {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.1rem;
    color: #64748b;
  }

  .empty-container a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 600;
  }

  .empty-container a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    .products-section {
      padding: 2rem 1rem;
    }
    
    .section-title {
      font-size: 2rem;
    }
    
    .category-section {
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .category-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    
    .product-card {
      min-width: 240px;
      max-width: 240px;
    }
    
    .horizontal-scroll {
      gap: 1rem;
    }
    
    .poster-slide {
      flex: 0 0 280px;
      height: 380px;
      padding: 1rem;
    }
    
    .navbar {
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .product-card {
      min-width: 200px;
      max-width: 200px;
    }
    
    .category-title {
      font-size: 1.5rem;
    }
    
    .section-title {
      font-size: 1.75rem;
    }
  }
`;

if (!document.querySelector('style[data-poster-styles]')) {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  styleElement.setAttribute('data-poster-styles', '');
  document.head.appendChild(styleElement);
}