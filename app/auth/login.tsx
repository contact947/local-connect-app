import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const { login, loading, error } = useFirebaseAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);

    // バリデーション
    if (!email.trim()) {
      setLocalError("メールアドレスを入力してください");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("有効なメールアドレスを入力してください");
      return;
    }
    if (!password.trim()) {
      setLocalError("パスワードを入力してください");
      return;
    }

    try {
      await login(email, password);
      router.replace("/(tabs)" as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      setLocalError(errorMessage);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="flex-1 justify-center gap-6">
          {/* ヘッダー */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">ログイン</Text>
            <Text className="text-muted">アカウントにログイン</Text>
          </View>

          {/* エラーメッセージ */}
          {(localError || error) && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{localError || error}</Text>
            </View>
          )}

          {/* フォーム */}
          <View className="gap-4">
            {/* メールアドレス */}
            <View className="gap-2">
              <Text className="text-foreground font-semibold">メールアドレス</Text>
              <TextInput
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#999"
              />
            </View>

            {/* パスワード */}
            <View className="gap-2">
              <Text className="text-foreground font-semibold">パスワード</Text>
              <TextInput
                placeholder="パスワード"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* ログインボタン */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="bg-primary rounded-full py-3 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">ログイン</Text>
            )}
          </Pressable>

          {/* 新規登録へのリンク */}
          <View className="flex-row justify-center gap-1">
            <Text className="text-muted">アカウントをお持ちでない方は</Text>
            <Pressable onPress={() => router.push("/auth/signup" as any)}>
              <Text className="text-primary font-semibold">新規登録</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
