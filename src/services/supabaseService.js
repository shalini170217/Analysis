import { supabase } from "./supabaseClient";

export const getTrendByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .eq('category', category)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching trend for ${category}:`, error.message);
    throw error;
  }
};

export const saveTrend = async ({ category, geminiOutput, chartData }) => {
  try {
    // Validate chartData structure
    if (!Array.isArray(chartData) || !chartData.every(item => item.product && item.upvotes)) {
      throw new Error("Invalid chartData format. Expected array of {product, upvotes} objects");
    }

    const { data, error } = await supabase
      .from('trends')
      .upsert({
        category,
        gemini_output: geminiOutput,
        chart_data: chartData,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error saving trend for ${category}:`, error.message);
    throw error;
  }
};

// Helper function to check if table exists and has data
export const checkTrendsTable = async () => {
  try {
    const { data, error } = await supabase
      .from('trends')
      .select('*')
      .limit(1);

    if (error) throw error;
    return { exists: true, hasData: data.length > 0 };
  } catch (error) {
    if (error.message.includes('relation "trends" does not exist')) {
      return { exists: false, hasData: false };
    }
    throw error;
  }
};

export const savePoster = async ({ category, content, analysis, chartData }) => {
  const { data, error } = await supabase
    .from('posters')
    .upsert([
      {
        category,
        content,
        analysis,
        chart_data: chartData,
        updated_at: new Date().toISOString()
      }
    ])
    .select();

  if (error) throw error;
  return data;
};
export const getLatestPoster = async () => {
  const { data, error } = await supabase
    .from('posters')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};