import { ScrollView, Text, View, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { useState, useCallback, useMemo } from "react";
import { useColors } from "@/hooks/use-colors";

const categories = [
  { label: "すべて", value: "all" as const },
  { label: "グルメ", value: "store" as const },
  { label: "イベント", value: "event" as const },
  { label: "コラム", value: "column" as const },
  { label: "インタビュー", value: "interview" as const },
];

type NewsTab = "national" | "region";

export default function NewsScreen() {
  const colors = useColors();
  const { user, profile } = useFirebaseAuthContext();
  const [activeTab, setActiveTab] = useState<NewsTab>("national");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  // 全国のニュース取得
  const { data: nationalNews = [], isLoading: loadingNational, refetch: refetchNational } = trpc.articles.list.useQuery(
    {
      category: selectedCategory === "all" ? undefined : (selectedCategory as "event" | "interview" | "other" | "store" | "column"),
      limit: 50,
    },
    {
      enabled: !!user && activeTab === "national",
    }
  );

  // 地域のニュース取得（全ニュース取得）
  const { data: allRegionNews = [], isLoading: loadingRegion, refetch: refetchRegion } = trpc.articles.list.useQuery(
    {
      category: selectedCategory === "all" ? undefined : (selectedCategory as "event" | "interview" | "other" | "store" | "column"),
      limit: 50,
    },
    {
      enabled: !!user && activeTab === "region" && !!profile?.address,
    }
  );

  // ユーザーの登録県を抽出
  const userPrefecture = useMemo(() => {
    if (!profile?.address) return null;
    // 住所の最初の要素が都道府県（例："東京都 渋谷区"）
    return profile.address.split(" ")[0] || null;
  }, [profile?.address]);

  // 地域ニュースをユーザーの県でフィルタリング
  const regionNews = useMemo(() => {
    if (!allRegionNews || !userPrefecture) return [];
    return allRegionNews.filter((article) => {
      // 記事の都道府県フィールドを確認
      const articlePrefecture = article.prefecture || "";
      return articlePrefecture === userPrefecture;
    });
  }, [allRegionNews, userPrefecture]);

  // 新しい投稿を上から順に表示（降順でソート）
  const sortedNationalNews = useMemo(() => {
    return [...nationalNews].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [nationalNews]);

  const sortedRegionNews = useMemo(() => {
    return [...regionNews].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [regionNews]);

  // キーワード検索でフィルタリング
  const filteredNationalNews = useMemo(() => {
    if (!searchQuery.trim()) return sortedNationalNews;
    const query = searchQuery.toLowerCase();
    return sortedNationalNews.filter((article) =>
      article.title.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query))
    );
  }, [sortedNationalNews, searchQuery]);

  const filteredRegionNews = useMemo(() => {
    if (!searchQuery.trim()) return sortedRegionNews;
    const query = searchQuery.toLowerCase();
    return sortedRegionNews.filter((article) =>
      article.title.toLowerCase().includes(query) ||
      (article.content && article.content.toLowerCase().includes(query))
    );
  }, [sortedRegionNews, searchQuery]);

  const newsData = activeTab === "national" ? filteredNationalNews : filteredRegionNews;
  const isLoading = activeTab === "national" ? loadingNational : loadingRegion;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchNational(), refetchRegion()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchNational, refetchRegion]);

  if (!user) {
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
              <Text className="text-muted mt-1">
                {activeTab === "national" ? "全国のニュース" : "地域のニュース"}
              </Text>
            </View>

            {/* 検索バー */}
            <View className="mb-4">
              <TextInput
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground"
                placeholder="検索..."
                placeholderTextColor={colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
            </View>

            {/* タブ切り替え（全国のニュース / 地域のニュース） */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl border ${
                  activeTab === "national" ? "bg-primary border-primary" : "bg-surface border-border"
                }`}
                onPress={() => setActiveTab("national")}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === "national" ? "text-background" : "text-foreground"
                  }`}
                >
                  全国のニュース
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl border ${
                  activeTab === "region" ? "bg-primary border-primary" : "bg-surface border-border"
                }`}
                onPress={() => setActiveTab("region")}
              >
                <Text
                  className={`text-center font-semibold ${
                    activeTab === "region" ? "text-background" : "text-foreground"
                  }`}
                >
                  地域のニュース
                </Text>
              </TouchableOpacity>
            </View>

            {/* カテゴリフィター */}
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
