import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { router, useLocalSearchParams } from "expo-router";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { useState } from "react";

export default function GiftDetailScreen() {
  const { user } = useFirebaseAuthContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const giftId = id ? parseInt(id, 10) : null;
  const [isUsing, setIsUsing] = useState(false);

  // ギフト詳細取得
  const { data: gift, isLoading, error } = trpc.gifts.getById.useQuery(
    { id: giftId! },
    {
      enabled: !!user && !!giftId,
    }
  );

  // ギフト利用可能状態確認
  const { data: usageStatus, isLoading: isCheckingUsage } = trpc.gifts.checkUsage.useQuery(
    { giftId: giftId! },
    {
      enabled: !!user && !!giftId,
    }
  );

  // ギフト使用Mutation
  const useMutation = trpc.gifts.use.useMutation({
    onSuccess: (data) => {
      Alert.alert(
        "ギフト使用成功",
        `ギフトを使用しました。\nQRコード: ${data.qrCode}`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    },
    onError: (error) => {
      Alert.alert("ギフト使用失敗", error.message || "ギフトの使用に失敗しました");
    },
  });

  const handleUseGift = async () => {
    if (!gift || !usageStatus?.canUse) return;

    setIsUsing(true);
    try {
      await useMutation.mutateAsync({
        giftId: gift.id,
      });
    } finally {
      setIsUsing(false);
    }
  };

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">ギフト詳細</Text>
        <Text className="text-muted text-center mb-6">ログインしてギフトを利用しましょう</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.push('/auth/welcome')}
        >
          <Text className="text-background font-semibold">ログイン</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (isLoading || isCheckingUsage) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (error || !gift || !usageStatus) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">エラー</Text>
        <Text className="text-muted text-center mb-6">
          ギフトを読み込めませんでした
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

  const isExpired = gift.expiryDate && new Date(gift.expiryDate) < new Date();

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
          {gift.imageUrl && (
            <View className="mb-6 rounded-2xl overflow-hidden bg-muted h-64">
              <Image
                source={{ uri: gift.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          {/* ステータスバッジ */}
          <View className="mb-4 flex-row gap-2">
            {isExpired && (
              <View className="bg-error rounded-full px-3 py-1">
                <Text className="text-background text-xs font-semibold">期限切れ</Text>
              </View>
            )}
            {!usageStatus.canUse && !isExpired && (
              <View className="bg-warning rounded-full px-3 py-1">
                <Text className="text-background text-xs font-semibold">利用上限に達しました</Text>
              </View>
            )}
            {usageStatus.canUse && (
              <View className="bg-success rounded-full px-3 py-1">
                <Text className="text-background text-xs font-semibold">利用可能</Text>
              </View>
            )}
          </View>

          {/* タイトル */}
          <Text className="text-3xl font-bold text-foreground mb-2">
            {gift.giftTitle}
          </Text>

          {/* 店舗名 */}
          <Text className="text-lg text-muted mb-6">
            {gift.storeName}
          </Text>

          {/* ギフト情報 */}
          <View className="mb-6 space-y-4">
            {/* 説明 */}
            <View className="p-4 bg-surface rounded-xl border border-border">
              <Text className="text-foreground leading-relaxed">
                {gift.description}
              </Text>
            </View>

            {/* 住所 */}
            {(gift.prefecture || gift.city || gift.address) && (
              <View className="p-4 bg-surface rounded-xl border border-border">
                <Text className="text-muted text-sm mb-2">住所</Text>
                <Text className="text-foreground font-semibold">
                  {gift.prefecture}
                  {gift.city && ` ${gift.city}`}
                  {gift.address && ` ${gift.address}`}
                </Text>
              </View>
            )}

            {/* 有効期限 */}
            {gift.expiryDate && (
              <View className="p-4 bg-surface rounded-xl border border-border">
                <Text className="text-muted text-sm mb-2">有効期限</Text>
                <Text className={`text-foreground font-semibold ${isExpired ? 'text-error' : ''}`}>
                  {new Date(gift.expiryDate).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            )}

            {/* 利用上限 */}
            <View className="p-4 bg-surface rounded-xl border border-border">
              <Text className="text-muted text-sm mb-2">利用状況</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-semibold">
                  {usageStatus.usageCount} / {usageStatus.usageLimit} 回
                </Text>
                <View className="flex-1 ml-4 bg-border rounded-full h-2 overflow-hidden">
                  <View
                    className="bg-primary h-full"
                    style={{
                      width: `${(usageStatus.usageCount / usageStatus.usageLimit) * 100}%`,
                    }}
                  />
                </View>
              </View>
            </View>

            {/* 年齢制限 */}
            {gift.ageRestriction && (
              <View className="p-4 bg-surface rounded-xl border border-border">
                <Text className="text-muted text-sm mb-2">年齢制限</Text>
                <Text className="text-foreground font-semibold">
                  {gift.ageRestriction}才以上
                </Text>
              </View>
            )}

            {/* 学校種別制限 */}
            {gift.schoolTypeRestriction && gift.schoolTypeRestriction !== "none" && (
              <View className="p-4 bg-surface rounded-xl border border-border">
                <Text className="text-muted text-sm mb-2">対象者</Text>
                <Text className="text-foreground font-semibold">
                  {gift.schoolTypeRestriction === "high_school" && "高校生"}
                  {gift.schoolTypeRestriction === "university" && "大学生"}
                  {gift.schoolTypeRestriction === "working" && "社会人"}
                </Text>
              </View>
            )}
          </View>

          {/* ギフト使用ボタン */}
          {usageStatus.canUse && !isExpired && (
            <View className="mb-8">
              <TouchableOpacity
                className="bg-primary py-4 rounded-xl active:opacity-80"
                onPress={handleUseGift}
                disabled={isUsing || useMutation.isPending}
              >
                {isUsing || useMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-background font-semibold text-center text-lg">
                    ギフトを使用する
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {!usageStatus.canUse && (
            <View className="mb-8 p-6 bg-surface rounded-xl border border-border items-center">
              <Text className="text-muted">
                {isExpired ? "このギフトは期限切れです" : "このギフトの利用上限に達しました"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
