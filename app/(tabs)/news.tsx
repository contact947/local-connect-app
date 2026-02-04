import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function NewsScreen() {
  const colors = useColors();
  const [selectedCategory, setSelectedCategory] = useState<
    "store" | "event" | "interview" | "column" | "other" | undefined
  >(undefined);

  const { data: articles, isLoading, refetch } = trpc.articles.list.useQuery({
    category: selectedCategory,
    limit: 20,
  });

  // Pull to Refresh
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const categories = [
    { value: undefined, label: "すべて" },
    { value: "store" as const, label: "店舗" },
    { value: "event" as const, label: "イベント" },
    { value: "interview" as const, label: "インタビュー" },
    { value: "column" as const, label: "コラム" },
  ];

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">ニュース</Text>
          <Text className="text-muted mt-1">全国の最新情報</Text>
        </View>

        {/* カテゴリフィルター */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-grow-0 py-2"
            contentContainerStyle={{ 
              gap: 8, 
              alignItems: 'center',
              paddingHorizontal: 24 // スクロール時に端まで表示されるようこちらに移動
            }}
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

        {/* 記事一覧 */}
        <ScrollView
          className="flex-1 px-6"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {isLoading && !articles ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : articles && articles.length > 0 ? (
            <View className="gap-4 pb-6">
              {articles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  className="bg-surface rounded-2xl overflow-hidden border border-border"
                >
                  {article.imageUrl && (
                    <Image
                      source={{ uri: article.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-primary px-3 py-1 rounded-full mr-2">
                        <Text className="text-background text-xs font-semibold">
                          {article.category === "store"
                            ? "店舗"
                            : article.category === "event"
                              ? "イベント"
                              : article.category === "interview"
                                ? "インタビュー"
                                : article.category === "column"
                                  ? "コラム"
                                  : "その他"}
                        </Text>
                      </View>
                      {article.prefecture && (
                        <View className="bg-surface border border-border px-3 py-1 rounded-full mr-2">
                          <Text className="text-foreground text-xs">
                            {article.prefecture}
                            {article.city}
                          </Text>
                        </View>
                      )}
                      <Text className="text-muted text-xs">
                        {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                      </Text>
                    </View>
                    <Text className="text-foreground font-bold text-lg mb-2" numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text className="text-muted text-sm" numberOfLines={3}>
                      {article.content}
                    </Text>
                    <View className="flex-row items-center mt-3">
                      <Text className="text-muted text-xs">{article.viewCount} 回閲覧</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-muted">ニュースがまだありません</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
