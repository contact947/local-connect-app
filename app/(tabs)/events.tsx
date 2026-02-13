import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert, RefreshControl, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";

type EventTab = "region" | "national";

export default function EventsScreen() {
  const colors = useColors();
  const { user, profile } = useFirebaseAuthContext();
  const [activeTab, setActiveTab] = useState<EventTab>("national");



  // 全国のイベント取得
  const { data: nationalEvents, isLoading: nationalLoading, refetch: refetchNationalEvents } = trpc.events.list.useQuery(
    {
      limit: 20,
    },
    {
      enabled: !!user && activeTab === "national",
    }
  );

  // 地域のイベント取得（全イベント取得）
  const { data: allRegionEvents, isLoading: regionLoading, refetch: refetchRegionEvents } = trpc.events.list.useQuery(
    {
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

  // 地域イベントをユーザーの県でフィルタリング
  const regionEvents = useMemo(() => {
    if (!allRegionEvents || !userPrefecture) return [];
    return allRegionEvents.filter((event) => {
      // イベント会場から都道府県を抽出
      const eventPrefecture = event.venue?.split(" ")[0] || "";
      return eventPrefecture === userPrefecture;
    });
  }, [allRegionEvents, userPrefecture]);

  // Pull to Refresh
  const { refreshing: nationalRefreshing, onRefresh: onRefreshNational } = usePullToRefresh(refetchNationalEvents);
  const { refreshing: regionRefreshing, onRefresh: onRefreshRegion } = usePullToRefresh(refetchRegionEvents);

  const handleEventPress = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const eventData = (activeTab === "national" ? nationalEvents : regionEvents) || [];
  const isLoading = activeTab === "national" ? nationalLoading : regionLoading;
  const refreshing = activeTab === "national" ? nationalRefreshing : regionRefreshing;
  const onRefresh = activeTab === "national" ? onRefreshNational : onRefreshRegion;

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">イベント</Text>
          <Text className="text-muted mt-1">
            {activeTab === "national" ? "全国のイベント" : "地域のイベント"}
          </Text>
        </View>

        {!user && (
          <View className="mx-6 mb-4 p-4 bg-surface rounded-2xl border border-border">
            <Text className="text-foreground font-semibold mb-2">ログインしてイベントを表示</Text>
            <Text className="text-muted text-sm mb-3">
              ログインすると、チケット購入やイベント参加ができます
            </Text>
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl"
              onPress={() => router.push('/auth/login')}
            >
              <Text className="text-center font-semibold text-background">ログイン</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* タブ切り替え（全国のイベント / 地域のイベント） */}
        {user && (
          <View className="px-6 pb-4 flex-row gap-3">
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
                全国のイベント
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
                地域のイベント
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* コンテンツ */}
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
          {activeTab === "national" ? (
            nationalLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" />
              </View>
            ) : nationalEvents && nationalEvents.length > 0 ? (
              <View className="gap-4 pb-6">
                {nationalEvents.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    className="bg-surface rounded-2xl overflow-hidden border border-border"
                    onPress={() => handleEventPress(event.id)}
                  >
                    {event.imageUrl && (
                      <Image
                        source={{ uri: event.imageUrl }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    )}
                    <View className="p-4">
                      <Text className="text-foreground font-bold text-lg mb-2">{event.title}</Text>
                      <Text className="text-muted text-sm mb-3" numberOfLines={2}>
                        {event.description}
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">📅</Text>
                          <Text className="text-muted text-sm">
                            {new Date(event.eventDate).toLocaleString("ja-JP")}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">📍</Text>
                          <Text className="text-muted text-sm">{event.venue}</Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                          <Text className="text-primary font-bold text-lg">¥{event.price}</Text>
                          {event.availableTickets !== null && (
                            <Text className="text-muted text-sm">残り {event.availableTickets} 枚</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-muted">全国のイベントがまだありません</Text>
              </View>
            )
          ) : isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : eventData.length > 0 ? (
            <View className="gap-4 pb-6">
              {eventData.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  className="bg-surface rounded-2xl overflow-hidden border border-border"
                  onPress={() => handleEventPress(event.id)}
                >
                  {event.imageUrl && (
                    <Image
                      source={{ uri: event.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <Text className="text-foreground font-bold text-lg mb-2">{event.title}</Text>
                    <Text className="text-muted text-sm mb-3" numberOfLines={2}>
                      {event.description}
                    </Text>
                    <View className="gap-2">
                      <View className="flex-row items-center">
                        <Text className="text-muted text-sm mr-2">📅</Text>
                        <Text className="text-muted text-sm">
                          {new Date(event.eventDate).toLocaleString("ja-JP")}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-muted text-sm mr-2">📍</Text>
                        <Text className="text-muted text-sm">{event.venue}</Text>
                      </View>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-primary font-bold text-lg">¥{event.price}</Text>
                        {event.availableTickets !== null && (
                          <Text className="text-muted text-sm">残り {event.availableTickets} 枚</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-muted">地域のイベントがまだありません</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
