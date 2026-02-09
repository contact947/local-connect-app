import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { router, useLocalSearchParams } from "expo-router";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";

export default function NewsDetailScreen() {
  const { user } = useFirebaseAuthContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const articleId = id ? parseInt(id, 10) : null;

  // ニュース詳細取得
  const { data: article, isLoading, error } = trpc.articles.getById.useQuery(
    { id: articleId! },
    {
      enabled: !!user && !!articleId,
    }
  );

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">ニュース詳細</Text>
        <Text className="text-muted text-center mb-6">ログインしてニュースを読みましょう</Text>
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

  if (error || !article) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">エラー</Text>
        <Text className="text-muted text-center mb-6">
          ニュースを読み込めませんでした
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
          {article.imageUrl && (
            <View className="mb-6 rounded-2xl overflow-hidden bg-muted h-64">
              <Image
                source={{ uri: article.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}

          {/* カテゴリと日付 */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-primary rounded-full px-3 py-1">
              <Text className="text-background text-xs font-semibold">
                {article.category}
              </Text>
            </View>
            <Text className="text-muted text-xs">
              {new Date(article.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* タイトル */}
          <Text className="text-3xl font-bold text-foreground mb-4">
            {article.title}
          </Text>

          {/* 地域情報 */}
          {(article.prefecture || article.city) && (
            <View className="mb-6 p-4 bg-surface rounded-xl border border-border">
              <Text className="text-muted text-sm mb-2">地域</Text>
              <Text className="text-foreground font-semibold">
                {article.prefecture}
                {article.city && ` ${article.city}`}
              </Text>
            </View>
          )}

          {/* 本文 */}
          <View className="mb-8">
            <Text className="text-foreground leading-relaxed text-base">
              {article.content}
            </Text>
          </View>

          {/* 閲覧数 */}
          <View className="py-4 border-t border-border">
            <Text className="text-muted text-sm">
              閲覧数: {article.viewCount || 0}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
