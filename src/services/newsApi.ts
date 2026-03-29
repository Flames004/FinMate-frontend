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
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`
    );
    const data = await response.json();
    
    // Map Finnhub response format to our NewsArticle interface
    const mappedData = data.slice(0, 15).map((item: any) => ({
      id: String(item.id || Math.random().toString()),
      title: item.headline || "No title",
      source: item.source || "Unknown",
      imageurl: item.image || "",
      url: item.url || "",
      body: item.summary || "",
      published_on: item.datetime || Date.now() / 1000
    }));
    
    return mappedData;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
};
