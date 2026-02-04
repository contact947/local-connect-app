import { useState } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";

export default function EventsScreen() {
  const colors = useColors();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "local">("upcoming");

  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myTickets, isLoading: ticketsLoading, refetch: refetchTickets } = trpc.tickets.myTickets.useQuery(
    undefined,
    {
      enabled: isAuthenticated && activeTab === "upcoming",
    }
  );

  const { data: localEvents, isLoading: eventsLoading, refetch: refetchEvents } = trpc.events.list.useQuery(
    {
      prefecture: profile?.prefecture || undefined,
      city: profile?.city || undefined,
      limit: 20,
    },
    {
      enabled: isAuthenticated && activeTab === "local" && !!profile,
    }
  );

  // Pull to Refresh
  const { refreshing: ticketsRefreshing, onRefresh: onRefreshTickets } = usePullToRefresh(refetchTickets);
  const { refreshing: eventsRefreshing, onRefresh: onRefreshEvents } = usePullToRefresh(refetchEvents);

  const handleEventPress = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">イベント</Text>
          <Text className="text-muted mt-1">地域のイベントをチェック</Text>
        </View>

        {!isAuthenticated && (
          <View className="mx-6 mb-4 p-4 bg-surface rounded-2xl border border-border">
            <Text className="text-foreground font-semibold mb-2">ログインしてイベントを表示</Text>
            <Text className="text-muted text-sm mb-3">
              ログインすると、チケット購入やイベント参加ができます
            </Text>
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl"
              onPress={() => router.push("/(tabs)/account")}
            >
              <Text className="text-center font-semibold text-background">ログイン</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* タブ切り替え */}
        {isAuthenticated && (
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
                activeTab === "local" ? "bg-primary border-primary" : "bg-surface border-border"
              }`}
              onPress={() => setActiveTab("local")}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === "local" ? "text-background" : "text-foreground"
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
              refreshing={activeTab === "upcoming" ? ticketsRefreshing : eventsRefreshing}
              onRefresh={activeTab === "upcoming" ? onRefreshTickets : onRefreshEvents}
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
          ) : eventsLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : localEvents && localEvents.length > 0 ? (
            <View className="gap-4 pb-6">
              {localEvents.map((event) => (
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
