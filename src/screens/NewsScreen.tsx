import React, { useEffect, useState } from "react";
import { FlatList, Image, Linking, Pressable, Text, View, ActivityIndicator } from "react-native";
import { fetchFinanceNews, NewsArticle } from "../services/newsApi";

export default function NewsScreen() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNews() {
      const data = await fetchFinanceNews();
      setNews(data);
      setLoading(false);
    }
    getNews();
  }, []);

  const openArticle = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Could not open url", err));
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#34d399" />
        <Text className="mt-4 text-sm text-slate-400">Fetching latest stories…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-bold text-white">Market Feed</Text>
            <Text className="mt-1 text-sm text-slate-400">
              Stay informed with the latest financial news & trends.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text style={{ fontSize: 40 }}>📰</Text>
            <Text className="mt-4 text-lg font-semibold text-white">
              No Stories Right Now
            </Text>
            <Text className="mt-2 text-sm text-slate-400 text-center">
              Pull down to refresh or check back later for the latest market news.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            className="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"
            onPress={() => openArticle(item.url)}
          >
            {item.imageurl && (
              <Image
                source={{ uri: item.imageurl }}
                className="h-44 w-full"
                resizeMode="cover"
              />
            )}
            <View className="p-5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="rounded-full bg-emerald-900/30 border border-emerald-800 px-3 py-0.5">
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    {item.source}
                  </Text>
                </View>
                {index < 3 && (
                  <View className="rounded-full bg-amber-900/30 border border-amber-800 px-2 py-0.5">
                    <Text className="text-[10px] font-bold uppercase text-amber-400">
                      Trending
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-base font-bold text-white leading-snug">
                {item.title}
              </Text>
              <Text className="mt-2 text-sm text-slate-400 leading-relaxed" numberOfLines={2}>
                {item.body}
              </Text>
              <Text className="mt-3 text-xs font-semibold text-emerald-400">
                Read Full Article →
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
