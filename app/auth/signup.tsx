import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { useState } from "react";

export default function SignUpScreen() {
  const { signup, loading, error } = useFirebaseAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setLocalError(null);

    // バリデーション
    if (!name.trim()) {
      setLocalError("氏名を入力してください");
      return;
    }
    if (!email.trim()) {
      setLocalError("メールアドレスを入力してください");
      return;
    }
    if (!email.includes("@")) {
      setLocalError("有効なメールアドレスを入力してください");
      return;
    }
    if (password.length < 6) {
      setLocalError("パスワードは6文字以上で設定してください");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("パスワードが一致しません");
      return;
    }

    try {
      await signup(email, password, name);
      router.replace("/(tabs)" as any);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "登録に失敗しました";
      setLocalError(errorMessage);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-8">
        <View className="flex-1 justify-center gap-6">
          {/* ヘッダー */}
          <View className="mb-4">
            <Text className="text-3xl font-bold text-foreground">アカウント作成</Text>
            <Text className="text-muted mt-2">LocalConnectへようこそ</Text>
          </View>

          {/* エラーメッセージ */}
          {(localError || error) && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{localError || error}</Text>
            </View>
          )}

          {/* フォーム */}
          <View className="gap-4">
            {/* 氏名 */}
            <View className="gap-2">
              <Text className="text-foreground font-semibold">氏名</Text>
              <TextInput
                placeholder="山田太郎"
                value={name}
                onChangeText={setName}
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#999"
              />
            </View>

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
                placeholder="6文字以上"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#999"
              />
            </View>

            {/* パスワード確認 */}
            <View className="gap-2">
              <Text className="text-foreground font-semibold">パスワード確認</Text>
              <TextInput
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* 登録ボタン */}
          <Pressable
            onPress={handleSignUp}
            disabled={loading}
            className="bg-primary rounded-full py-3 active:opacity-80"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">アカウントを作成</Text>
            )}
          </Pressable>

          {/* ログインリンク */}
          <View className="flex-row justify-center gap-1">
            <Text className="text-muted">既にアカウントをお持ちの方は</Text>
            <Pressable onPress={() => router.push("/auth/login" as any)}>
              <Text className="text-primary font-semibold">ログイン</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
