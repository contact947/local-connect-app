import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { QRCodeDisplayScreen } from "@/components/qr-code-display-screen";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function GiftDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const giftId = parseInt(id || "0", 10);

  // ギフト詳細取得
  const { data: gift, isLoading: giftLoading } = trpc.gifts.getById.useQuery(
    { id: giftId },
    { enabled: giftId > 0 }
  );

  // ギフト使用可能状況確認
  const { data: usageStatus } = trpc.gifts.checkUsage.useQuery(
    { giftId },
    { enabled: giftId > 0 }
  );

  // ギフト使用Mutation
  const useMutation = trpc.gifts.use.useMutation();

  const handleUseGift = async () => {
    if (!gift) return;

    Alert.alert(
      "ギフトを使用しますか？",
      `${gift.giftTitle}\nこの操作は取り消せません。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "使用する",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await useMutation.mutateAsync({ giftId: gift.id });
              setQrCode(result.qrCode);
              setShowQRCode(true);
            } catch (err) {
              Alert.alert(
                "エラー",
                `ギフト使用に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}`
              );
            }
          },
        },
      ]
    );
  };

  if (giftLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!gift) {
    return (
      <ScreenContainer className="items-center justify-center p-4">
        <Text className="text-lg font-semibold text-foreground mb-4">ギフトが見つかりません</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-background font-semibold">戻る</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const expiryDate = gift.expiryDate ? new Date(gift.expiryDate) : new Date();
  const formattedExpiry = expiryDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isExpired = gift.expiryDate ? expiryDate < new Date() : false;
  const canUse = usageStatus?.canUse && !isExpired;

  return (
    <ScreenContainer className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* ギフト画像 */}
        {gift.imageUrl && (
          <Image
            source={{ uri: gift.imageUrl }}
            style={{ width: "100%", height: 250 }}
            contentFit="cover"
          />
        )}

        {/* コンテンツ */}
        <View className="p-4 flex-1">
          {/* タイトル */}
          <Text className="text-3xl font-bold text-foreground mb-2">{gift.giftTitle}</Text>

          {/* 店舗名 */}
          <Text className="text-lg font-semibold text-primary mb-4">{gift.storeName}</Text>

          {/* ステータス */}
          {isExpired && (
            <View className="bg-error/10 border border-error rounded-lg p-3 mb-4">
              <Text className="text-sm font-semibold text-error">有効期限が切れています</Text>
            </View>
          )}

          {!canUse && !isExpired && (
            <View className="bg-warning/10 border border-warning rounded-lg p-3 mb-4">
              <Text className="text-sm font-semibold text-warning">
                使用回数の上限に達しています
              </Text>
            </View>
          )}

          {/* ギフト情報 */}
          <View className="bg-surface rounded-lg p-4 mb-4 gap-3">
            {/* 説明 */}
            <View>
              <Text className="text-sm font-semibold text-muted mb-1">特典内容</Text>
              <Text className="text-sm text-foreground">{gift.description}</Text>
            </View>

            {/* 住所 */}
            <View>
              <Text className="text-sm font-semibold text-muted mb-1">住所</Text>
              <Text className="text-sm text-foreground">{gift.address}</Text>
            </View>

            {/* 有効期限 */}
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-semibold text-muted">有効期限</Text>
              <Text className={cn("text-sm font-semibold", isExpired ? "text-error" : "text-foreground")}>
                {formattedExpiry}
              </Text>
            </View>

            {/* 使用可能回数 */}
            {usageStatus && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-muted">使用可能回数</Text>
                <Text className="text-sm text-foreground">
                  {usageStatus.usageLimit - usageStatus.usageCount}/{usageStatus.usageLimit}
                </Text>
              </View>
            )}

            {/* 年齢制限 */}
            {gift.ageRestriction && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-muted">年齢制限</Text>
                <Text className="text-sm text-foreground">{gift.ageRestriction}歳以上</Text>
              </View>
            )}

            {/* 学校区分制限 */}
            {gift.schoolTypeRestriction && gift.schoolTypeRestriction !== "none" && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-semibold text-muted">対象</Text>
                <Text className="text-sm text-foreground">
                  {gift.schoolTypeRestriction === "high_school"
                    ? "高校生"
                    : gift.schoolTypeRestriction === "university"
                      ? "大学生"
                      : gift.schoolTypeRestriction === "working"
                        ? "新社会人"
                        : "その他"}
                </Text>
              </View>
            )}
          </View>

          {/* 利用条件 */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">利用条件</Text>
            <Text className="text-xs text-muted leading-relaxed">
              • このギフトは1回限りの使用です
              {"\n"}• 有効期限内にのみ使用できます
              {"\n"}• 払い戻しはできません
              {"\n"}• 他のキャンペーンとの併用はできません
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 固定使用ボタン */}
      <View className="p-4 border-t border-border bg-background">
        <TouchableOpacity
          onPress={handleUseGift}
          disabled={!canUse || useMutation.isPending}
          className={cn(
            "py-4 rounded-full items-center",
            canUse && !useMutation.isPending ? "bg-primary" : "bg-muted"
          )}
        >
          {useMutation.isPending ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className={cn("font-bold text-lg", canUse ? "text-background" : "text-muted")}>
              {isExpired ? "有効期限切れ" : !canUse ? "使用不可" : "このギフトを使用する"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QRコード表示画面 */}
      {showQRCode && qrCode && (
        <QRCodeDisplayScreen qrCode={qrCode} onClose={() => {
          setShowQRCode(false);
          router.back();
        }} />
      )}
    </ScreenContainer>
  );
}
