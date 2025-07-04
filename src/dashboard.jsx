// --- Updated Dashboard.jsx ---
import { useState, useEffect } from "react";
import { fetchTrendingPosts } from "./services/redditService";
import { analyzeRedditPosts } from "./services/geminiService";
import { getTrendByCategory, saveTrend, checkTrendsTable } from "./services/supabaseService";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { RotateCw } from 'react-feather';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CATEGORIES = [
  "Grocery", "Clothing and Apparel",
  "Health and Beauty", "Electronics",
  "Home and Furniture", "Household Essentials",
  "Toys and Baby", "Sports",
  "Stationery", "Pets",
  "Party Supplies", "Pharmacy"
];

export default function Dashboard() {
  const [dataMap, setDataMap] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);
  const [errorMap, setErrorMap] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tableStatus, setTableStatus] = useState({ exists: null });

  useEffect(() => {
    const initialize = async () => {
      try {
        const status = await checkTrendsTable();
        setTableStatus(status);

        if (status.exists) {
          const promises = CATEGORIES.map(async (category) => {
            try {
              const trend = await getTrendByCategory(category);
              return { category, trend };
            } catch (error) {
              console.error(`Error fetching ${category}:`, error);
              return { category, trend: null };
            }
          });

          const results = await Promise.all(promises);
          const newDataMap = {};

          results.forEach(({ category, trend }) => {
            if (trend) {
              newDataMap[category] = {
                chartData: Array.isArray(trend.chart_data) ? trend.chart_data : [],
                updatedAt: new Date(trend.updated_at).toLocaleString()
              };
            }
          });

          setDataMap(newDataMap);
        }
      } catch (error) {
        console.error("Initialization failed:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initialize();
  }, []);

  const handleRefresh = async (category) => {
    setLoadingCategory(category);
    setErrorMap(prev => ({ ...prev, [category]: "" }));

    try {
      const posts = await fetchTrendingPosts(category);
      const { response, suggestions } = await analyzeRedditPosts(posts);

      const validChartData = Array.isArray(suggestions)
        ? suggestions.filter(item => item.product && item.upvotes)
        : [];

      await saveTrend({
        category,
        geminiOutput: response,
        chartData: validChartData
      });

      setDataMap(prev => ({
        ...prev,
        [category]: {
          chartData: validChartData,
          updatedAt: new Date().toLocaleString()
        }
      }));
    } catch (err) {
      setErrorMap(prev => ({ ...prev, [category]: err.message }));
      console.error(`Refresh failed for ${category}:`, err);
    } finally {
      setLoadingCategory(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (tableStatus.exists === false) {
    return (
      <div className="error-screen">
        <h2>Database Error</h2>
        <p>The `trends` table doesn't exist in your Supabase database.</p>
        <p>Please create it using the provided SQL schema.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title"> Retail Trend Dashboard</h1>

      <div className="categories-grid">
        {CATEGORIES.map(category => {
          const data = dataMap[category];
          const isLoading = loadingCategory === category;
          const error = errorMap[category];

          return (
            <div key={category} className="category-card">
              <h2>{category}</h2>

              {error && <p className="error-message">{error}</p>}
              {!data && !error && (
                <p className="no-data-message">No data yet. Try refreshing this category.</p>
              )}

              {data?.chartData?.length > 0 ? (
                <div className="chart-container">
                  <h4>📊 Product Influence</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.chartData}
                        dataKey="upvotes"
                        nameKey="product"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ product, upvotes }) => `${product} (${upvotes})`}
                      >
                        {data.chartData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} upvotes`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="no-chart-message">No chart data available</p>
              )}

              <div className="card-footer">
                {data?.updatedAt && (
                  <small className="update-time">Last updated: {data.updatedAt}</small>
                )}
                <button
                  onClick={() => handleRefresh(category)}
                  disabled={isLoading}
                  className={`refresh-button ${isLoading ? "loading" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="spinning-icon" size={16} />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw size={16} />
                      <span>Refresh</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .dashboard-title {
          color: #3b82f6;
          text-align: center;
          margin-bottom: 2rem;
        }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .category-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.5rem;
          background-color: #f9fafb;
          min-height: 350px;
          display: flex;
          flex-direction: column;
        }
        .error-message {
          color: #ef4444;
        }
        .no-data-message, .no-chart-message {
          color: #6b7280;
        }
        .chart-container {
          margin: 1rem 0;
          flex-grow: 1;
        }
        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .update-time {
          color: #6b7280;
        }
        .refresh-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .refresh-button:hover {
          opacity: 0.9;
        }
        .refresh-button.loading {
          opacity: 0.7;
        }
        .spinning-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .loading-screen, .error-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3b82f6;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
