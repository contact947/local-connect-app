import { ScrollView, Text, View, FlatList, ActivityIndicator, RefreshControl, Pressable, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { useInitialRoute } from "@/hooks/use-initial-route";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { useState, useMemo } from "react";

export default function HomeScreen() {
  useInitialRoute();
  const { user, profile } = useFirebaseAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  // ユーザーの登録県を取得（addressから都道府県を抽出）
  const userPrefecture = useMemo(() => {
    if (!profile?.address) return null;
    // addressの最初の空白までが都道府県名（例: "東京都 渋谷区" → "東京都"）
    return profile.address.split(" ")[0];
  }, [profile?.address]);

  // トップニュース取得
  const { data: topNews, refetch: refetchTopNews, isLoading: loadingTopNews } = trpc.articles.list.useQuery({
    limit: 10,
  });

  // 地域ニュース取得（フィルタリングなし、全国の地域ニュースを取得）
  const { data: allRegionNews, refetch: refetchRegionNews } = trpc.articles.list.useQuery(
    {
      limit: 50, // より多く取得してからフィルタリング
    },
    { enabled: !!userPrefecture }
  );

  // 参加予定イベント取得
  const { data: upcomingEvents, refetch: refetchUpcomingEvents } = trpc.events.list.useQuery(
    {
      limit: 10,
    },
    { enabled: !!user?.uid }
  );

  // 地域イベント取得（フィルタリングなし、全国の地域イベントを取得）
  const { data: allRegionEvents, refetch: refetchRegionEvents } = trpc.events.list.useQuery(
    {
      limit: 50, // より多く取得してからフィルタリング
    },
    { enabled: !!userPrefecture }
  );

  // ユーザーの県に該当するニュースをフィルタリング
  const regionNews = useMemo(() => {
    if (!allRegionNews || !userPrefecture) return [];
    return allRegionNews.filter((article) => {
      // prefectureフィールドがユーザーの登録県と一致するものをフィルタリング
      return article.prefecture === userPrefecture;
    }).slice(0, 10); // 最大10件に制限
  }, [allRegionNews, userPrefecture]);

  // ユーザーの県に該当するイベントをフィルタリング
  const regionEvents = useMemo(() => {
    if (!allRegionEvents || !userPrefecture) return [];
    return allRegionEvents.filter((event) => {
      // prefectureフィールドがユーザーの登録県と一致するものをフィルタリング
      return event.prefecture === userPrefecture;
    }).slice(0, 10); // 最大10件に制限
  }, [allRegionEvents, userPrefecture]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchTopNews(),
        refetchRegionNews(),
        refetchUpcomingEvents(),
        refetchRegionEvents(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  if (loadingTopNews) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-0"
      >
        <View className="gap-6 py-4">
          {/* ウェルカムメッセージ */}
          <View className="px-4">
            <Text className="text-2xl font-bold text-foreground">
              {user?.displayName ? `${user.displayName}さん、こんにちは` : "ようこそ"}
            </Text>
            <Text className="text-muted mt-1">
              {userPrefecture ? `${userPrefecture}の最新情報をチェック` : "地域の最新情報をチェック"}
            </Text>
          </View>

          {/* 全国のトップニュース */}
          <View>
            <View className="flex-row justify-between items-center mb-3 px-4">
              <Text className="text-lg font-bold text-foreground">全国のトップニュース</Text>
              <Pressable onPress={() => router.push("/(tabs)/news")}>
                <Text className="text-primary text-sm">もっと見る</Text>
              </Pressable>
            </View>
            {topNews && topNews.length > 0 ? (
              <FlatList
                data={topNews}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/news/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
                    style={{ width: 280 }}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-full h-40 bg-muted"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-40 bg-muted items-center justify-center">
                        <Text className="text-xs text-muted">画像</Text>
                      </View>
                    )}
                    <View className="p-3">
                      <Text className="text-xs text-primary font-semibold mb-1">
                        {item.category}
                      </Text>
                      <Text className="text-sm font-bold text-foreground line-clamp-2 mb-2">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            ) : (
              <View className="px-4">
                <Text className="text-muted text-center py-4">ニュースがありません</Text>
              </View>
            )}
          </View>

          {/* 参加予定のイベント */}
          {upcomingEvents && upcomingEvents.length > 0 && user && (
            <View>
              <View className="flex-row justify-between items-center mb-3 px-4">
                <Text className="text-lg font-bold text-foreground">参加予定のイベント</Text>
                <Pressable onPress={() => router.push("/(tabs)/events")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={upcomingEvents}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/events/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
                    style={{ width: 280 }}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-full h-40 bg-muted"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-40 bg-muted items-center justify-center">
                        <Text className="text-xs text-muted">画像</Text>
                      </View>
                    )}
                    <View className="p-3">
                      <Text className="text-foreground font-bold text-sm mb-2" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View className="gap-1">
                        <View className="flex-row items-center">
                          <Text className="text-muted text-xs mr-2">📅</Text>
                          <Text className="text-muted text-xs">
                            {new Date(item.eventDate).toLocaleDateString("ja-JP")}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-muted text-xs mr-2">📍</Text>
                          <Text className="text-muted text-xs" numberOfLines={1}>
                            {item.venue}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* 地域のニュース */}
          {regionNews && regionNews.length > 0 && userPrefecture && (
            <View>
              <View className="flex-row justify-between items-center mb-3 px-4">
                <Text className="text-lg font-bold text-foreground">{userPrefecture}のニュース</Text>
                <Pressable onPress={() => router.push("/(tabs)/news")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={regionNews}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/news/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
                    style={{ width: 280 }}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-full h-40 bg-muted"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-40 bg-muted items-center justify-center">
                        <Text className="text-xs text-muted">画像</Text>
                      </View>
                    )}
                    <View className="p-3">
                      <Text className="text-xs text-primary font-semibold mb-1">
                        {item.category}
                      </Text>
                      <Text className="text-sm font-bold text-foreground line-clamp-2 mb-2">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* 地域のイベント */}
          {regionEvents && regionEvents.length > 0 && userPrefecture && (
            <View>
              <View className="flex-row justify-between items-center mb-3 px-4">
                <Text className="text-lg font-bold text-foreground">{userPrefecture}のイベント</Text>
                <Pressable onPress={() => router.push("/(tabs)/events")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={regionEvents}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                scrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/events/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border active:opacity-80"
                    style={{ width: 280 }}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-full h-40 bg-muted"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-40 bg-muted items-center justify-center">
                        <Text className="text-xs text-muted">画像</Text>
                      </View>
                    )}
                    <View className="p-3">
                      <Text className="text-foreground font-bold text-sm mb-2" numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View className="gap-1">
                        <View className="flex-row items-center">
                          <Text className="text-muted text-xs mr-2">📅</Text>
                          <Text className="text-muted text-xs">
                            {new Date(item.eventDate).toLocaleDateString("ja-JP")}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-muted text-xs mr-2">📍</Text>
                          <Text className="text-muted text-xs" numberOfLines={1}>
                            {item.venue}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
