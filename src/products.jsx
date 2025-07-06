import { useState } from "react";
import { supabase } from "./services/supabaseClient";
import bgImage from "./assets/bg4.jpg"; // adjust path as needed

const categories = [
  { label: "Grocery", table: "products_grocery", icon: "🛒" },
  { label: "Clothing", table: "products_clothing", icon: "👕" },
  { label: "Health & Beauty", table: "products_health", icon: "💄" },
  { label: "Electronics", table: "products_electronics", icon: "📱" },
  { label: "Home & Furniture", table: "products_home", icon: "🛋️" },
  { label: "Essentials", table: "products_essentials", icon: "🧻" },
  { label: "Toys & Baby", table: "products_toys", icon: "🧸" },
  { label: "Sports", table: "products_sports", icon: "⚽" },
  { label: "Stationery", table: "products_stationery", icon: "📝" },
  { label: "Pets", table: "products_pets", icon: "🐶" },
  { label: "Party Supplies", table: "products_party", icon: "🎉" },
  { label: "Pharmacy", table: "products_pharmacy", icon: "💊" },
];

export default function ProductsAdmin() {
  const [form, setForm] = useState({
    productName: "",
    description: "",
    stock: "",
    category: categories[0].table,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "productName") setImageError(false); // Reset image error when name changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from(form.category)
        .insert({
          name: form.productName,
          description: form.description,
          stock: parseInt(form.stock),
          upvotes: 0,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setForm({
        productName: "",
        description: "",
        stock: "",
        category: categories[0].table,
      });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImagePreviewUrl = () => {
    return imageError
      ? `https://source.unsplash.com/featured/300x300/?${encodeURIComponent(
          form.productName || "product"
        )}`
      : `https://api.dicebear.com/7.x/icons/svg?seed=${encodeURIComponent(form.productName)}`;
  };

  return (
    <div className="admin-container"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "100vh",
            padding: "2rem"
          }}
    >
      <div className="admin-card">
        <div className="card-header">
          <h2>Add New Product</h2>
          <p>Fill out the form to add a new product to inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="productName">
                <span className="label-icon">📛</span> Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                placeholder="e.g. Mac Laptop"
                value={form.productName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <span className="label-icon">📝</span> Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the product features..."
                value={form.description}
                onChange={handleChange}
                required
                className="form-textarea"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">
                <span className="label-icon">📦</span> Stock Quantity
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
                required
                className="form-input"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                <span className="label-icon">🏷️</span> Category
              </label>
              <div className="select-wrapper">
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {categories.map((cat) => (
                    <option key={cat.table} value={cat.table}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

         

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className={`submit-btn ${loading ? "loading" : ""}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Adding Product...
                </>
              ) : (
                <>
                  <span className="btn-icon">➕</span> Add Product
                </>
              )}
            </button>
          </div>

          {success && (
            <div className="success-message">
              <div className="success-content">
                <span className="success-icon">✓</span>
                <div>
                  <h3>Product Added Successfully!</h3>
                  <p>Your new product is now available in inventory.</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      <style jsx>{`
        .admin-container {
          width: 100%;
          padding: 2rem 1rem;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
        }

        .admin-card {
          width: 100%;
          max-width: 900px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
          color: white;
        }

        .card-header h2 {
          margin: 0;
          font-size: 1.5rem;
        }

        .card-header p {
          margin: 0.5rem 0 0;
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .product-form {
          padding: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .form-group:nth-child(2) {
            grid-column: span 2;
          }
        }

        .form-group {
          width: 100%;
        }

        label {
          display: block;
          margin-bottom: 0.75rem;
          font-weight: 500;
          color: #4a5568;
          font-size: 0.95rem;
        }

        .label-icon {
          margin-right: 8px;
          font-size: 1.1em;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background-color: #f8fafc;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
          background-color: white;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper::after {
          content: "▼";
          position: absolute;
          top: 50%;
          right: 1rem;
          transform: translateY(-50%);
          pointer-events: none;
          color: #718096;
          font-size: 0.8rem;
        }

        .form-select {
          appearance: none;
          padding-right: 2.5rem;
        }

        .image-preview-container {
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px dashed #e2e8f0;
        }

        .image-preview-container h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: #4a5568;
        }

        .image-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          min-height: 250px;
          position: relative;
        }

        .image-wrapper img {
          max-width: 100%;
          max-height: 250px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          object-fit: contain;
        }

        .image-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #718096;
          font-style: italic;
        }

        .preview-note {
          margin: 0;
          font-size: 0.85rem;
          color: #718096;
          font-style: italic;
          text-align: center;
        }

        .form-actions {
          margin-top: 2rem;
          text-align: center;
        }

        .submit-btn {
          background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-icon {
          font-size: 1.2em;
        }

        .spinner {
          width: 1.2rem;
          height: 1.2rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .success-message {
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: #f0fff4;
          border-radius: 8px;
          border: 1px solid #c6f6d5;
        }

        .success-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .success-icon {
          font-size: 1.5rem;
          color: #38a169;
          margin-top: 2px;
        }

        .success-message h3 {
          margin: 0 0 0.25rem;
          color: #2f855a;
        }

        .success-message p {
          margin: 0;
          color: #38a169;
          font-size: 0.95rem;
        }
      `}</style>

      
    </div>
  );
}
