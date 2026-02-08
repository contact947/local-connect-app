import { useState, useMemo } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert, RefreshControl, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { extractPrefectureFromAddress } from "@/types/prefecture";

type EventSegment = "region" | "national";
type EventTab = "upcoming" | "list";

export default function EventsScreen() {
  const colors = useColors();
  const { user, profile } = useFirebaseAuthContext();
  const [segment, setSegment] = useState<EventSegment>("region");
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");

  // 参加予定チケット取得
  const { data: myTickets, isLoading: ticketsLoading, refetch: refetchTickets } = trpc.tickets.myTickets.useQuery(
    undefined,
    {
      enabled: !!user && activeTab === "upcoming",
    }
  );

  // 全国のイベント取得
  const { data: allEvents, isLoading: allEventsLoading, refetch: refetchAllEvents } = trpc.events.list.useQuery(
    {
      limit: 50,
    },
    {
      enabled: !!user && activeTab === "list",
    }
  );

  // Pull to Refresh
  const { refreshing: ticketsRefreshing, onRefresh: onRefreshTickets } = usePullToRefresh(refetchTickets);
  const { refreshing: allEventsRefreshing, onRefresh: onRefreshAllEvents } = usePullToRefresh(refetchAllEvents);

  // ユーザーの登録県を取得
  const userPrefecture = useMemo(() => {
    if (!profile?.address) return null;
    return extractPrefectureFromAddress(profile.address) || null;
  }, [profile?.address]);

  // セグメント別にイベントをフィルタリングしてソート
  const filteredAndSortedEvents = useMemo(() => {
    if (!allEvents) return [];

    // 現在日時を取得
    const now = new Date();

    // セグメント別にフィルタリング
    let filtered = allEvents;
    if (segment === "region" && userPrefecture) {
      filtered = allEvents.filter((event) => {
        const eventPrefecture = extractPrefectureFromAddress(event.venue) || "";
        return eventPrefecture === userPrefecture;
      });
    }

    // 開催日が現在から近い順でソート
    return filtered.sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime();
      const dateB = new Date(b.eventDate).getTime();

      // 過去のイベントは後ろに
      const aIsPast = dateA < now.getTime();
      const bIsPast = dateB < now.getTime();

      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;

      // 同じカテゴリ（過去/未来）内では日付が近い順
      return Math.abs(dateA - now.getTime()) - Math.abs(dateB - now.getTime());
    });
  }, [allEvents, segment, userPrefecture]);

  const handleEventPress = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const isLoading = activeTab === "upcoming" ? ticketsLoading : allEventsLoading;
  const refreshing = activeTab === "upcoming" ? ticketsRefreshing : allEventsRefreshing;
  const onRefresh = activeTab === "upcoming" ? onRefreshTickets : onRefreshAllEvents;

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">イベント</Text>
          <Text className="text-muted mt-1">
            {activeTab === "upcoming" ? "参加予定のイベント" : (segment === "region" ? "地域のイベント" : "全国のイベント")}
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

        {/* タブ切り替え（参加予定 / イベント一覧） */}
        {user && (
          <View className="px-6 pb-4 flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                activeTab === "upcoming" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setActiveTab("upcoming")}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "upcoming" ? "text-background" : "text-foreground"
                }`}
              >
                参加予定
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl border ${
                activeTab === "list" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setActiveTab("list")}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "list" ? "text-background" : "text-foreground"
                }`}
              >
                イベント一覧
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* セグメント切り替え（地域 / 全国） - イベント一覧タブのみ表示 */}
        {user && activeTab === "list" && (
          <View className="px-6 pb-4 flex-row gap-2">
            <Pressable
              onPress={() => setSegment("region")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                segment === "region"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  segment === "region" ? "text-background" : "text-foreground"
                }`}
              >
                地域のイベント
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSegment("national")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                segment === "national"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold text-sm ${
                  segment === "national" ? "text-background" : "text-foreground"
                }`}
              >
                全国のイベント
              </Text>
            </Pressable>
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
          {activeTab === "upcoming" ? (
            ticketsLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" />
              </View>
            ) : myTickets && myTickets.length > 0 ? (
              <View className="gap-4 pb-6">
                {myTickets.map((item) => (
                  <TouchableOpacity
                    key={item.ticket.id}
                    className="bg-surface rounded-2xl overflow-hidden border border-border"
                    onPress={() => {
                      // チケットQRコード表示
                      Alert.alert("チケットQRコード", item.ticket.qrCode, [
                        { text: "閉じる", style: "cancel" },
                      ]);
                    }}
                  >
                    {item.event?.imageUrl && (
                      <Image
                        source={{ uri: item.event.imageUrl }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    )}
                    <View className="p-4">
                      <Text className="text-foreground font-bold text-lg mb-2">
                        {item.event?.title || "イベント"}
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">📅</Text>
                          <Text className="text-muted text-sm">
                            {item.event?.eventDate
                              ? new Date(item.event.eventDate).toLocaleString("ja-JP")
                              : "日時未定"}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">📍</Text>
                          <Text className="text-muted text-sm">{item.event?.venue || "会場未定"}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">🎫</Text>
                          <Text className="text-muted text-sm">{item.ticket.quantity}枚</Text>
                        </View>
                      </View>
                      <View className="mt-3 pt-3 border-t border-border">
                        <Text
                          className={`text-sm font-semibold ${
                            item.ticket.isUsed ? "text-muted" : "text-success"
                          }`}
                        >
                          {item.ticket.isUsed ? "使用済み" : "未使用"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="py-8 items-center">
                <Text className="text-muted">参加予定のイベントがありません</Text>
              </View>
            )
          ) : isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : filteredAndSortedEvents.length > 0 ? (
            <View className="gap-4 pb-6">
              {filteredAndSortedEvents.map((event) => (
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
              <Text className="text-muted">
                {segment === "region" ? "地域のイベント" : "全国のイベント"}がまだありません
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
