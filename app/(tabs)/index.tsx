import { ScrollView, Text, View, FlatList, ActivityIndicator, RefreshControl, Pressable, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { useInitialRoute } from "@/hooks/use-initial-route";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { useState } from "react";

export default function HomeScreen() {
  useInitialRoute();
  const { user } = useFirebaseAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  // トップニュース取得
  const { data: topNews, refetch: refetchTopNews, isLoading: loadingTopNews } = trpc.articles.list.useQuery({
    limit: 3,
  });

  // 地域ニュース取得
  const { data: regionNews, refetch: refetchRegionNews } = trpc.articles.list.useQuery(
    {
      limit: 3,
      prefecture: user?.address?.split(" ")[0] || undefined,
    },
    { enabled: !!user?.address }
  );

  // 参加予定イベント取得
  const { data: upcomingEvents, refetch: refetchUpcomingEvents } = trpc.events.list.useQuery(
    {
      limit: 3,
    },
    { enabled: !!user?.uid }
  );

  // 地域イベント取得
  const { data: regionEvents, refetch: refetchRegionEvents } = trpc.events.list.useQuery(
    {
      limit: 3,
      prefecture: user?.address?.split(" ")[0] || undefined,
    },
    { enabled: !!user?.address }
  );

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
        className="px-4"
      >
        <View className="gap-6 py-4">
          {/* ウェルカムメッセージ */}
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {user?.name ? `${user.name}さん、こんにちは` : "ようこそ"}
            </Text>
            <Text className="text-muted mt-1">地域の最新情報をチェック</Text>
          </View>

          {/* 全国のトップニュース */}
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-foreground">全国のトップニュース</Text>
              <Pressable onPress={() => router.push("/(tabs)/news")}>
                <Text className="text-primary text-sm">もっと見る</Text>
              </Pressable>
            </View>
            {topNews && topNews.length > 0 ? (
              <FlatList
                data={topNews}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/news/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border mb-3 active:opacity-80"
                  >
                    <View className="flex-row">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-24 h-24 bg-muted"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-24 h-24 bg-muted items-center justify-center">
                          <Text className="text-xs text-muted">画像</Text>
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
                  </Pressable>
                )}
              />
            ) : (
              <Text className="text-muted text-center py-4">ニュースがありません</Text>
            )}
          </View>

          {/* 参加予定のイベント */}
          {upcomingEvents && upcomingEvents.length > 0 && user && (
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-foreground">参加予定のイベント</Text>
                <Pressable onPress={() => router.push("/(tabs)/events")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={upcomingEvents}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/events/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border mb-3 active:opacity-80"
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
          {regionNews && regionNews.length > 0 && (
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-foreground">地域のニュース</Text>
                <Pressable onPress={() => router.push("/(tabs)/news")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={regionNews}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/news/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border mb-3 active:opacity-80"
                  >
                    <View className="flex-row">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="w-24 h-24 bg-muted"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-24 h-24 bg-muted items-center justify-center">
                          <Text className="text-xs text-muted">画像</Text>
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
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* 地域のイベント */}
          {regionEvents && regionEvents.length > 0 && (
            <View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-foreground">地域のイベント</Text>
                <Pressable onPress={() => router.push("/(tabs)/events")}>
                  <Text className="text-primary text-sm">もっと見る</Text>
                </Pressable>
              </View>
              <FlatList
                data={regionEvents}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/events/${item.id}` as any)}
                    className="bg-surface rounded-2xl overflow-hidden border border-border mb-3 active:opacity-80"
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
