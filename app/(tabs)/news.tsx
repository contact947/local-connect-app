import { ScrollView, Text, View, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import { useState, useCallback } from "react";

const categories = [
  { label: "すべて", value: "all" as const },
  { label: "グルメ", value: "store" as const },
  { label: "イベント", value: "event" as const },
  { label: "コラム", value: "column" as const },
  { label: "インタビュー", value: "interview" as const },
];

export default function NewsScreen() {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: newsData = [], isLoading, refetch } = trpc.articles.list.useQuery(
    {
      category: selectedCategory === "all" ? undefined : (selectedCategory as "event" | "interview" | "other" | "store" | "column"),
    },
    {
      enabled: isAuthenticated,
    }
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">ニュース</Text>
        <Text className="text-muted text-center mb-6">ログインしてニュースを読みましょう</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.push('/auth/welcome')}
        >
          <Text className="text-background font-semibold">ログイン</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View className="px-6 pb-4">
            {/* ヘッダー */}
            <View className="mb-4">
              <Text className="text-3xl font-bold text-foreground">ニュース</Text>
              <Text className="text-muted mt-1">全国の最新情報</Text>
            </View>

            {/* カテゴリフィルター */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="py-2"
              contentContainerStyle={{ gap: 8, alignItems: 'center', paddingHorizontal: 0 }}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.label}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === category.value
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                  onPress={() => setSelectedCategory(category.value)}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      selectedCategory === category.value ? "text-background" : "text-foreground"
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/news/${item.id}` as any)}
            className="mx-6 mb-4 bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
          >
            <View className="flex-row">
              {item.imageUrl && (
                <View className="w-24 h-24 bg-muted">
                  <Text className="text-xs text-muted p-2">画像</Text>
                </View>
              )}
              <View className="flex-1 p-3 justify-between">
                <View>
                  <Text className="text-xs text-primary font-semibold mb-1">
                    {item.category}
                  </Text>
                  <Text className="text-sm font-bold text-foreground line-clamp-2">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-xs text-muted">
                  {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-muted">ニュースがありません</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </ScreenContainer>
  );
}
