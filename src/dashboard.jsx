import { useState, useEffect } from "react";
import bgImage from "./assets/bg.jpg"; // adjust path as needed

import { fetchTrendingPosts } from "./services/redditService";
import { analyzeRedditPosts } from "./services/geminiService";
import { getTrendByCategory, saveTrend, checkTrendsTable } from "./services/supabaseService";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { RotateCw } from 'react-feather';

const CATEGORIES = [
  "Grocery", "Clothing and Apparel",
  "Health and Beauty", "Electronics",
  "Home and Furniture", "Household Essentials",
  "Toys and Baby", "Sports",
  "Stationery", "Pets",
  "Party Supplies", "Pharmacy"
];

// Subtle pastel card background colors
const CARD_COLORS = {
  "Grocery": "#fef3c7",
  "Clothing and Apparel": "#e0f2fe",
  "Health and Beauty": "#fce7f3",
  "Electronics": "#ede9fe",
  "Home and Furniture": "#f3f4f6",
  "Household Essentials": "#fef9c3",
  "Toys and Baby": "#ffe4e6",
  "Sports": "#d1fae5",
  "Stationery": "#e0e7ff",
  "Pets": "#f1f5f9",
  "Party Supplies": "#faf5ff",
  "Pharmacy": "#f0fdf4"
};

// Subtle pie slice colors
const PIE_COLORS = [
  "#3b82f6", "#60a5fa", "#38bdf8", "#2563eb", "#818cf8",
  "#4ade80", "#22c55e", "#10b981", "#34d399", "#fde68a"
];

export default function Dashboard() {
  const [dataMap, setDataMap] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);
  const [errorMap, setErrorMap] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [tableStatus, setTableStatus] = useState({ exists: null, hasData: null });

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
        <p>The trends table doesn't exist in your Supabase database.</p>
        <p>Please create the table using the SQL schema provided.</p>
      </div>
    );
  }

  if (tableStatus.exists === true && tableStatus.hasData === false) {
    return (
      <div className="empty-screen">
        <h2>No Data Available</h2>
        <p>Your database is connected but contains no trend data.</p>
        <p>Try refreshing some categories to populate the dashboard.</p>
      </div>
    );
  }

  return (
    <div
  className="dashboard-container"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    padding: "2rem"
  }}
>

      <h1 className="dashboard-title"> Retail Trend Dashboard</h1>

      <div className="categories-grid">
        {CATEGORIES.map((category, catIndex) => {
          const data = dataMap[category];
          const isLoading = loadingCategory === category;
          const error = errorMap[category];

          return (
            <div
              key={category}
              className="category-card"
              style={{ backgroundColor: CARD_COLORS[category] }}
            >
              <h2>{category}</h2>

              {error && <p className="error-message">{error}</p>}

              {data?.chartData?.length > 0 ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.chartData}
                        dataKey="upvotes"
                        nameKey="product"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        labelLine={false}
                        label={false}
                      >
                        {data.chartData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
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
                  <small className="update-time">
                    Last updated: {data.updatedAt}
                  </small>
                )}
                <button
                  onClick={() => handleRefresh(category)}
                  disabled={isLoading}
                  className={`refresh-button ${isLoading ? 'loading' : ''}`}
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
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-title {
          color:rgb(0, 0, 0);
          text-align: center;
          margin-bottom: 2rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .category-card {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          min-height: 480px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease;
        }

        .category-card:hover {
          transform: scale(1.01);
        }

        .error-message {
          color: #ef4444;
          margin: 0.5rem 0;
        }

        .no-chart-message {
          color: #6b7280;
          margin: 1rem 0;
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
          border-radius: 6px;
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

        .loading-screen, .error-screen, .empty-screen {
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
