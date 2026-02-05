import { View, Text, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { startOAuthLogin } from "@/constants/oauth";

export default function AuthWelcomeScreen() {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await startOAuthLogin();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="justify-center items-center px-6">
      <View className="gap-8 items-center w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <View className="gap-4 items-center">
          {/* ロゴ画像 */}
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center">
            <Text className="text-4xl font-bold text-background">LC</Text>
          </View>

          {/* タイトル */}
          <View className="gap-2 items-center">
            <Text className="text-4xl font-bold text-foreground">LocalConnect</Text>
            <Text className="text-lg text-muted text-center">
              地域とつながる、新しい体験
            </Text>
          </View>
        </View>

        {/* 説明文 */}
        <View className="gap-3 items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted">✓</Text>
            <Text className="text-sm text-muted">地域のイベント情報をチェック</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted">✓</Text>
            <Text className="text-sm text-muted">お得なギフトを使用する</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-muted">✓</Text>
            <Text className="text-sm text-muted">チケットを購入して参加</Text>
          </View>
        </View>

        {/* ボタン */}
        <View className="gap-3 w-full mt-4">
          {/* アカウント作成ボタン */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary px-6 py-4 rounded-full items-center active:opacity-80"
          >
            <Text className="text-background font-bold text-lg">
              {isLoading ? "処理中..." : "アカウントを作成する"}
            </Text>
          </TouchableOpacity>

          {/* ログインボタン */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="border border-primary px-6 py-4 rounded-full items-center active:opacity-80"
          >
            <Text className="text-primary font-bold text-lg">
              {isLoading ? "処理中..." : "ログイン"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 利用規約 */}
        <Text className="text-xs text-muted text-center mt-4">
          ログインすることで、利用規約とプライバシーポリシーに同意します
        </Text>
      </View>
    </ScreenContainer>
  );
}
