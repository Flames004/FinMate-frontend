export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  imageurl: string;
  url: string;
  body: string;
  published_on: number;
}

const API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;

export const fetchFinanceNews = async (): Promise<NewsArticle[]> => {
  try {
    const categories = ["general", "forex", "crypto", "merger"];
    const fetchPromises = categories.map(cat => 
      fetch(`https://finnhub.io/api/v1/news?category=${cat}&token=${API_KEY}`)
        .then(res => res.json())
        .catch(err => {
          console.error(`Error fetching category ${cat}:`, err);
          return [];
        })
    );

    const results = await Promise.all(fetchPromises);
    const combinedData = results.flat();
    
    // Map and Deduplicate by ID
    const seenIds = new Set();
    const mappedData = combinedData
      .filter((item: any) => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      })
      .map((item: any) => ({
        id: String(item.id || Math.random().toString()),
        title: item.headline || "No title",
        source: item.source || "Unknown",
        imageurl: item.image || "",
        url: item.url || "",
        body: item.summary || "",
        published_on: item.datetime || Date.now() / 1000
      }))
      // Sort by publication timestamp descending
      .sort((a, b) => b.published_on - a.published_on)
      .slice(0, 30); // Return top 30 stories
    
    return mappedData;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
