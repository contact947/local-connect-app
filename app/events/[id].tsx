import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { QRCodeDisplayScreen } from "@/components/qr-code-display-screen";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // QRコード表示時に輝度を最大に
  const eventId = parseInt(id || "0", 10);

  // イベント詳細取得
  const { data: event, isLoading, error } = trpc.events.getById.useQuery(
    { id: eventId },
    { enabled: eventId > 0 }
  );

  // チケット購入Mutation
  const purchaseMutation = trpc.tickets.purchase.useMutation();

  const handlePurchase = async () => {
    if (!event) return;

    try {
      const result = await purchaseMutation.mutateAsync({
        eventId: event.id,
        quantity,
      });

      // 購入成功 - QRコード表示画面へ
      setQrCode(result.qrCode);
      setShowQRCode(true);
      setShowPurchaseModal(false);
    } catch (err) {
      Alert.alert("エラー", `購入に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (error || !event) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-lg font-semibold text-foreground mb-4">イベントが見つかりません</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background font-semibold">戻る</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* ヘッダー画像 */}
        {event.imageUrl && (
          <Image
            source={{ uri: event.imageUrl }}
            style={{ width: "100%", height: 300 }}
            contentFit="cover"
          />
        )}

        {/* コンテンツ */}
        <View className="p-4 flex-1">
          {/* タイトル */}
          <Text className="text-3xl font-bold text-foreground mb-2">{event.title}</Text>

          {/* 地域情報 */}
          <Text className="text-sm text-muted mb-4">
            {event.prefecture} {event.city}
          </Text>

          {/* イベント情報 */}
          <View className="bg-surface rounded-lg p-4 mb-4 gap-3">
            {/* 開催日時 */}
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-muted w-20">開催日時</Text>
              <Text className="text-sm text-foreground flex-1">{formattedDate}</Text>
            </View>

            {/* 会場 */}
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-muted w-20">会場</Text>
              <Text className="text-sm text-foreground flex-1">{event.venue}</Text>
            </View>

            {/* 価格 */}
            <View className="flex-row items-center gap-3">
              <Text className="text-sm font-semibold text-muted w-20">価格</Text>
              <Text className="text-lg font-bold text-primary">¥{event.price}</Text>
            </View>

            {/* 残りチケット */}
            {event.availableTickets !== null && (
              <View className="flex-row items-center gap-3">
                <Text className="text-sm font-semibold text-muted w-20">残数</Text>
                <Text className="text-sm text-foreground">{event.availableTickets}枚</Text>
              </View>
            )}
          </View>

          {/* 説明 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">説明</Text>
            <Text className="text-sm text-muted leading-relaxed">{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* 固定購入ボタン */}
      <View className="p-4 border-t border-border bg-background">
        <TouchableOpacity
          onPress={() => setShowPurchaseModal(true)}
          className="bg-primary py-4 rounded-full items-center active:opacity-80"
        >
          <Text className="text-background font-bold text-lg">チケットを購入する</Text>
        </TouchableOpacity>
      </View>

      {/* QRコード表示画面 */}
      {showQRCode && qrCode && (
        <QRCodeDisplayScreen qrCode={qrCode} onClose={() => {
          setShowQRCode(false);
          router.back();
        }} />
      )}

      {/* 購入モーダル */}
      {showPurchaseModal && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <View className="bg-background rounded-2xl p-6 w-80 gap-4">
            <Text className="text-2xl font-bold text-foreground">チケット購入</Text>

            {/* 枚数選択 */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">枚数を選択</Text>
              <View className="flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-surface px-4 py-2 rounded-lg"
                >
                  <Text className="text-foreground font-bold">−</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-foreground flex-1 text-center">{quantity}枚</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(10, quantity + 1))}
                  className="bg-surface px-4 py-2 rounded-lg"
                >
                  <Text className="text-foreground font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 合計金額 */}
            <View className="bg-surface rounded-lg p-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">合計金額</Text>
                <Text className="text-2xl font-bold text-primary">
                  ¥{(parseFloat(event.price) * quantity).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* ボタン */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowPurchaseModal(false)}
                className="flex-1 bg-surface py-3 rounded-lg items-center"
              >
                <Text className="text-foreground font-semibold">キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending}
                className={cn(
                  "flex-1 py-3 rounded-lg items-center",
                  purchaseMutation.isPending ? "bg-muted" : "bg-primary"
                )}
              >
                {purchaseMutation.isPending ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-bold">購入確定</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
