import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider";
import { router } from "expo-router";
import { useState } from "react";

export default function SignUpScreen() {
  const { signUp, loading, error } = useFirebaseAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSignUp = async () => {
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
    if (password !== confirmPassword) {
      setLocalError("パスワードが一致しません");
      return;
    }
    if (password.length < 6) {
      setLocalError("パスワードは6文字以上である必要があります");
      return;
    }
    if (!name.trim()) {
      setLocalError("氏名を入力してください");
      return;
    }

    try {
      await signUp(email, password, name);
      Alert.alert("成功", "アカウントを作成しました");
      router.replace("/(tabs)");
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
            <View>
              <Text className="text-foreground font-semibold mb-2">氏名</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="山田太郎"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

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
                placeholder="6文字以上"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* パスワード確認 */}
            <View>
              <Text className="text-foreground font-semibold mb-2">パスワード確認</Text>
              <TextInput
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="パスワードを再入力"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* 登録ボタン */}
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-full active:opacity-80"
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-background font-bold text-center">アカウントを作成</Text>
            )}
          </TouchableOpacity>

          {/* ログインへのリンク */}
          <View className="flex-row justify-center gap-1 mt-4">
            <Text className="text-muted">既にアカウントをお持ちの方は</Text>
            <TouchableOpacity onPress={() => router.push("/auth/login" as any)}>
              <Text className="text-primary font-semibold">こちら</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
