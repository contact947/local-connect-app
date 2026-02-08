import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import * as Location from "expo-location";

export default function GiftsScreen() {
  const colors = useColors();
  const { user } = useFirebaseAuthContext();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setLocationError("位置情報の許可が必要です");
            return;
          }

          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        } catch (error) {
          console.error("Location error:", error);
          setLocationError("位置情報の取得に失敗しました");
        }
      })();
    }
  }, [user]);

  const { data: nearbyGifts, isLoading, refetch } = trpc.gifts.nearby.useQuery(
    {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      limit: 20,
    },
    {
      enabled: !!user && !!location,
    }
  );

  // Pull to Refresh
  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const handleGiftPress = (giftId: number) => {
    router.push(`/gifts/${giftId}`);
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">ギフト</Text>
          <Text className="text-muted mt-1">近くで使えるお得なギフト</Text>
        </View>

        {!user && (
          <View className="mx-6 mb-4 p-4 bg-surface rounded-2xl border border-border">
            <Text className="text-foreground font-semibold mb-2">ログインしてギフトを表示</Text>
            <Text className="text-muted text-sm mb-3">
              ログインすると、近くの店舗で使えるギフトが表示されます
            </Text>
            <TouchableOpacity
              className="bg-primary py-3 rounded-xl"
              onPress={() => router.push("/(tabs)/account")}
            >
              <Text className="text-center font-semibold text-background">ログイン</Text>
            </TouchableOpacity>
          </View>
        )}

        {locationError && user && (
          <View className="mx-6 mb-4 p-4 bg-error/10 rounded-2xl border border-error">
            <Text className="text-error font-semibold mb-2">位置情報エラー</Text>
            <Text className="text-error text-sm">{locationError}</Text>
          </View>
        )}

        {/* ギフト一覧 */}
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
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : !user || !location ? (
            <View className="py-8 items-center">
              <Text className="text-muted">
                {!user ? "ログインしてギフトを表示" : "位置情報を取得中..."}
              </Text>
            </View>
          ) : nearbyGifts && nearbyGifts.length > 0 ? (
            <View className="gap-4 pb-6">
              {nearbyGifts.map((gift) => (
                <TouchableOpacity
                  key={gift.id}
                  className="bg-surface rounded-2xl overflow-hidden border border-border"
                  onPress={() => handleGiftPress(gift.id)}
                >
                  {gift.imageUrl && (
                    <Image
                      source={{ uri: gift.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="text-foreground font-bold text-lg mb-1">
                          {gift.giftTitle}
                        </Text>
                        <Text className="text-muted text-sm">{gift.storeName}</Text>
                      </View>
                      <View className="bg-primary px-3 py-1 rounded-full">
                        <Text className="text-background text-xs font-semibold">
                          {gift.distance.toFixed(1)} km
                        </Text>
                      </View>
                    </View>
                    <Text className="text-muted text-sm mb-3" numberOfLines={2}>
                      {gift.description}
                    </Text>
                    <View className="gap-2">
                      {gift.address && (
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">📍</Text>
                          <Text className="text-muted text-sm">{gift.address}</Text>
                        </View>
                      )}
                      {gift.expiryDate && (
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">⏰</Text>
                          <Text className="text-muted text-sm">
                            有効期限: {new Date(gift.expiryDate).toLocaleDateString("ja-JP")}
                          </Text>
                        </View>
                      )}
                      {gift.usageLimit > 1 && (
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">🎫</Text>
                          <Text className="text-muted text-sm">
                            {gift.usageLimit}回まで利用可能
                          </Text>
                        </View>
                      )}
                      {gift.ageRestriction && (
                        <View className="flex-row items-center">
                          <Text className="text-muted text-sm mr-2">🔞</Text>
                          <Text className="text-muted text-sm">
                            {gift.ageRestriction}歳以上
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-muted">近くにギフトがありません</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
