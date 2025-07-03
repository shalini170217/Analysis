const subredditMap = {
  food: "food",
  dress: "fashion",
  makeup: "MakeupAddiction"
};

export async function fetchTrendingPosts(category) {
  const subreddit = subredditMap[category.toLowerCase()] || "all";
  const query = encodeURIComponent(category.toLowerCase());

  try {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${query}&restrict_sr=1&sort=top&t=week&limit=5`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RetailTrendDashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.data?.children) {
      throw new Error("Invalid Reddit response format");
    }

    return data.data.children.map(post => ({
      id: post.data.id,
      title: post.data.title,
      url: `https://www.reddit.com${post.data.permalink}`,
      upvotes: post.data.ups,
    }));

  } catch (err) {
    console.error("Reddit fetch error:", err);
    throw new Error(`Failed to fetch posts: ${err.message}`);
  }
}