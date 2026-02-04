import { ScrollView, Text, View, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { Image } from "expo-image";

import { ScreenContainer } from "@/components/screen-container";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";

export default function HomeScreen() {
  const colors = useColors();
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // ユーザーの地域に基づく記事を取得
  const {
    data: localArticles,
    isLoading: articlesLoading,
    refetch: refetchArticles,
  } = trpc.articles.list.useQuery(
    {
      prefecture: profile?.prefecture || undefined,
      city: profile?.city || undefined,
      limit: 10,
    },
    {
      enabled: isAuthenticated && !!profile,
    }
  );

  // Pull to Refresh
  const { refreshing, onRefresh } = usePullToRefresh(refetchArticles);

  const handleArticlePress = (articleId: number) => {
    router.push(`/article/${articleId}` as any);
  };

  return (
    <ScreenContainer>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1">
          {/* ヘッダー */}
          <View className="p-6 pb-4">
            <Text className="text-3xl font-bold text-foreground">
              {isAuthenticated ? `${profile?.prefecture || ""}のニュース` : "ホーム"}
            </Text>
            <Text className="text-muted mt-1">地域の最新情報をチェック</Text>
          </View>

          {!isAuthenticated && (
            <View className="mx-6 mb-4 p-4 bg-surface rounded-2xl border border-border">
              <Text className="text-foreground font-semibold mb-2">ログインして地域情報を表示</Text>
              <Text className="text-muted text-sm mb-3">
                ログインすると、あなたの地域に特化したニュースやイベント情報が表示されます
              </Text>
              <TouchableOpacity
                className="bg-primary py-3 rounded-xl"
                onPress={() => router.push("/(tabs)/account")}
              >
                <Text className="text-center font-semibold text-background">ログイン</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 記事一覧 */}
          <View className="px-6 flex-1">
            {articlesLoading && !localArticles ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : localArticles && localArticles.length > 0 ? (
              <View className="gap-4 pb-6">
                {localArticles.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    className="bg-surface rounded-2xl overflow-hidden border border-border"
                    onPress={() => handleArticlePress(article.id)}
                  >
                    {article.imageUrl && (
                      <Image
                        source={{ uri: article.imageUrl }}
                        style={{ width: "100%", height: 180 }}
                        contentFit="cover"
                      />
                    )}
                    <View className="p-4">
                      <View className="flex-row items-center gap-2 mb-2">
                        <Text className="text-xs font-semibold bg-primary text-background px-2 py-1 rounded">
                          {article.category === "store"
                            ? "店舗"
                            : article.category === "event"
                              ? "イベント"
                              : article.category === "interview"
                                ? "インタビュー"
                                : article.category === "column"
                                  ? "コラム"
                                  : "その他"}
                        </Text>
                      </View>
                      <Text className="text-foreground font-bold text-lg mb-2" numberOfLines={2}>
                        {article.title}
                      </Text>
                      <Text className="text-muted text-sm mb-3" numberOfLines={2}>
                        {article.content}
                      </Text>
                      <View className="flex-row justify-between items-center pt-3 border-t border-border">
                        <Text className="text-muted text-xs">
                          {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                        </Text>
                        <Text className="text-muted text-xs">👁 {article.viewCount}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : isAuthenticated ? (
              <View className="py-8 items-center">
                <Text className="text-muted">この地域のニュースはまだありません</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
