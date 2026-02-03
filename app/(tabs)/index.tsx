import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";

export default function HomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // ユーザーの地域に基づく記事を取得
  const { data: localArticles, isLoading: articlesLoading } = trpc.articles.list.useQuery(
    {
      prefecture: profile?.prefecture || undefined,
      city: profile?.city || undefined,
      limit: 10,
    },
    {
      enabled: isAuthenticated && !!profile,
    }
  );

  const handleArticlePress = (articleId: number) => {
    router.push(`/article/${articleId}` as any);
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1">
        {/* ヘッダー */}
        <View className="p-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">LocalConnect</Text>
          <Text className="text-muted mt-1">
            {isAuthenticated && profile
              ? `${profile.prefecture || ""}${profile.city || ""}の情報`
              : "地域の情報をチェック"}
          </Text>
        </View>

        {!isAuthenticated && (
          <View className="mx-6 mb-4 p-4 bg-surface rounded-2xl border border-border">
            <Text className="text-foreground font-semibold mb-2">ログインして地域情報を取得</Text>
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

        {/* 地域ニュース */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-foreground">地域のニュース</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/news")}>
              <Text className="text-primary font-semibold">もっと見る</Text>
            </TouchableOpacity>
          </View>

          {articlesLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : !isAuthenticated || !profile ? (
            <View className="py-8 items-center">
              <Text className="text-muted">ログインして地域のニュースを表示</Text>
            </View>
          ) : localArticles && localArticles.length > 0 ? (
            <View className="gap-4">
              {localArticles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  className="bg-surface rounded-2xl overflow-hidden border border-border"
                  onPress={() => handleArticlePress(article.id)}
                >
                  {article.imageUrl && (
                    <Image
                      source={{ uri: article.imageUrl }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-primary px-3 py-1 rounded-full mr-2">
                        <Text className="text-background text-xs font-semibold">
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
                      <Text className="text-muted text-xs">
                        {new Date(article.publishedAt).toLocaleDateString("ja-JP")}
                      </Text>
                    </View>
                    <Text className="text-foreground font-bold text-lg mb-2" numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text className="text-muted text-sm" numberOfLines={3}>
                      {article.content}
                    </Text>
                    <View className="flex-row items-center mt-3">
                      <Text className="text-muted text-xs">{article.viewCount} 回閲覧</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-muted">地域のニュースがまだありません</Text>
            </View>
          )}
        </View>

        {/* クイックアクセス */}
        <View className="px-6 pb-6">
          <Text className="text-xl font-bold text-foreground mb-4">クイックアクセス</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center"
              onPress={() => router.push("/(tabs)/events")}
            >
              <Text className="text-3xl mb-2">🎉</Text>
              <Text className="text-foreground font-semibold">イベント</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center"
              onPress={() => router.push("/(tabs)/gifts")}
            >
              <Text className="text-3xl mb-2">🎁</Text>
              <Text className="text-foreground font-semibold">ギフト</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
