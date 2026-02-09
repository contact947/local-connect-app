import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { router, useLocalSearchParams } from "expo-router";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { useState } from "react";

export default function EventDetailScreen() {
  const { user } = useFirebaseAuthContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = id ? parseInt(id, 10) : null;
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // イベント詳細取得
  const { data: event, isLoading, error } = trpc.events.getById.useQuery(
    { id: eventId! },
    {
      enabled: !!user && !!eventId,
    }
  );

  // チケット購入
  const purchaseMutation = trpc.tickets.purchase.useMutation({
    onSuccess: (data) => {
      Alert.alert(
        "購入成功",
        `チケットを購入しました。\nQRコード: ${data.qrCode}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      Alert.alert("購入失敗", error.message || "チケットの購入に失敗しました");
    },
  });

  const handlePurchase = async () => {
    if (!event) return;

    setIsPurchasing(true);
    try {
      await purchaseMutation.mutateAsync({
        eventId: event.id,
        quantity,
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">イベント詳細</Text>
        <Text className="text-muted text-center mb-6">ログインしてイベントを予約しましょう</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.push('/auth/welcome')}
        >
          <Text className="text-background font-semibold">ログイン</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (error || !event) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">エラー</Text>
        <Text className="text-muted text-center mb-6">
          イベントを読み込めませんでした
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-background font-semibold">戻る</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();
  const availableTickets = event.availableTickets ?? null;
  const canPurchase = isUpcoming && (availableTickets === null || availableTickets > 0);

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* ヘッダー */}
          <TouchableOpacity
            className="mb-6 flex-row items-center"
            onPress={() => router.back()}
          >
            <Text className="text-primary font-semibold">← 戻る</Text>
          </TouchableOpacity>

          {/* 画像 */}
          {event.imageUrl && (
            <View className="mb-6 rounded-2xl overflow-hidden bg-muted h-64">
              <Image
                source={{ uri: event.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          {/* ステータスバッジ */}
          <View className="mb-4">
            {!isUpcoming && (
              <View className="bg-muted rounded-full px-3 py-1 self-start">
                <Text className="text-foreground text-xs font-semibold">終了</Text>
              </View>
            )}
            {availableTickets !== null && availableTickets === 0 && isUpcoming && (
              <View className="bg-error rounded-full px-3 py-1 self-start">
                <Text className="text-background text-xs font-semibold">売り切れ</Text>
              </View>
            )}
          </View>

          {/* タイトル */}
          <Text className="text-3xl font-bold text-foreground mb-4">
            {event.title}
          </Text>

          {/* イベント情報 */}
          <View className="mb-6 space-y-4">
            {/* 開催日時 */}
            <View className="p-4 bg-surface rounded-xl border border-border">
              <Text className="text-muted text-sm mb-2">開催日時</Text>
              <Text className="text-foreground font-semibold text-base">
                {eventDate.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </Text>
              <Text className="text-foreground font-semibold text-base">
                {eventDate.toLocaleTimeString("ja-JP", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>

            {/* 会場 */}
            <View className="p-4 bg-surface rounded-xl border border-border">
              <Text className="text-muted text-sm mb-2">会場</Text>
              <Text className="text-foreground font-semibold">{event.venue}</Text>
              {(event.prefecture || event.city) && (
                <Text className="text-muted text-sm mt-1">
                  {event.prefecture}
                  {event.city && ` ${event.city}`}
                </Text>
              )}
            </View>

            {/* 料金 */}
            <View className="p-4 bg-surface rounded-xl border border-border">
              <Text className="text-muted text-sm mb-2">料金</Text>
              <Text className="text-foreground font-semibold text-lg">
                ¥{parseFloat(event.price).toLocaleString("ja-JP")}
              </Text>
            </View>

            {/* チケット残数 */}
            {availableTickets !== null && (
              <View className="p-4 bg-surface rounded-xl border border-border">
                <Text className="text-muted text-sm mb-2">チケット残数</Text>
                <Text className="text-foreground font-semibold">
                  {availableTickets} / {event.capacity}
                </Text>
              </View>
            )}
          </View>

          {/* 説明 */}
          <View className="mb-8">
            <Text className="text-foreground leading-relaxed text-base">
              {event.description}
            </Text>
          </View>

          {/* 購入セクション */}
          {canPurchase && (
            <View className="mb-8 p-6 bg-surface rounded-xl border border-border">
              <Text className="text-foreground font-semibold mb-4">チケットを購入</Text>

              {/* 数量選択 */}
              <View className="flex-row items-center mb-6">
                <Text className="text-foreground mr-4">枚数:</Text>
                <Pressable
                  onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="bg-border rounded-lg px-3 py-2 mr-2"
                >
                  <Text className="text-foreground font-semibold">−</Text>
                </Pressable>
                <Text className="text-foreground font-semibold text-lg w-8 text-center">
                  {quantity}
                </Text>
                <Pressable
                  onPress={() => quantity < 10 && setQuantity(quantity + 1)}
                  className="bg-border rounded-lg px-3 py-2 ml-2"
                >
                  <Text className="text-foreground font-semibold">+</Text>
                </Pressable>
              </View>

              {/* 合計金額 */}
              <View className="mb-6 p-4 bg-background rounded-lg">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted">小計</Text>
                  <Text className="text-foreground font-semibold">
                    ¥{(parseFloat(event.price) * quantity).toLocaleString("ja-JP")}
                  </Text>
                </View>
              </View>

              {/* 購入ボタン */}
              <TouchableOpacity
                className="bg-primary py-4 rounded-xl active:opacity-80"
                onPress={handlePurchase}
                disabled={isPurchasing || purchaseMutation.isPending}
              >
                {isPurchasing || purchaseMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-background font-semibold text-center text-lg">
                    購入する
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!canPurchase && (
            <View className="mb-8 p-6 bg-surface rounded-xl border border-border items-center">
              <Text className="text-muted">
                {!isUpcoming ? "このイベントは終了しました" : "チケットは売り切れです"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
