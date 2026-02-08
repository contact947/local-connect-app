import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider";
import { router } from "expo-router";
import { useState } from "react";

export default function LoginScreen() {
  const { signIn, loading, error } = useFirebaseAuthContext();
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
    if (!password.trim()) {
      setLocalError("パスワードを入力してください");
      return;
    }

    try {
      await signIn(email, password);
      Alert.alert("成功", "ログインしました");
      router.replace("/(tabs)");
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
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">ログイン</Text>
            <Text className="text-muted mt-2">アカウントにログイン</Text>
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
            <View>
              <Text className="text-foreground font-semibold mb-2">メールアドレス</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* パスワード */}
            <View>
              <Text className="text-foreground font-semibold mb-2">パスワード</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="パスワード"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* ログインボタン */}
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-full active:opacity-80"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-bold text-center">ログイン</Text>
            )}
          </TouchableOpacity>

          {/* 新規登録へのリンク */}
          <View className="flex-row justify-center gap-1 mt-4">
            <Text className="text-muted">アカウントをお持ちでない方は</Text>
            <TouchableOpacity onPress={() => router.push("/auth/signup" as any)}>
              <Text className="text-primary font-semibold">こちら</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
