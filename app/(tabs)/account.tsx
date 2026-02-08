import { useState, useEffect } from "react";
import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { getUserProfileFromFirestore, updateUserProfileInFirestore } from "@/lib/firestore-utils";

export default function AccountScreen() {
  const { user, loading: authLoading, logout } = useFirebaseAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "prefer_not_to_say",
    address: "",
    occupation: "",
  });

  // プロフィール取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getUserProfileFromFirestore(user.uid);
        setProfile(data);
        if (data) {
          setFormData({
            name: data.name || "",
            age: data.age?.toString() || "",
            gender: data.gender || "prefer_not_to_say",
            address: data.address || "",
            occupation: data.occupation || "",
          });
        }
      } catch (error) {
        console.error("プロフィール取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUserProfileInFirestore(user.uid, {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as "male" | "female" | "other" | "prefer_not_to_say",
        address: formData.address,
        occupation: formData.occupation,
      });

      // プロフィール再取得
      const updatedData = await getUserProfileFromFirestore(user.uid);
      setProfile(updatedData);
      setIsEditing(false);
      Alert.alert("成功", "プロフィールを更新しました");
    } catch (error) {
      Alert.alert("エラー", "プロフィール更新に失敗しました");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/auth/welcome" as any);
          } catch (error) {
            Alert.alert("エラー", "ログアウトに失敗しました");
          }
        },
      },
    ]);
  };

  if (authLoading || loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">アカウント</Text>
        <Text className="text-muted text-center mb-6">ログインしてプロフィールを管理しましょう</Text>
        <Pressable
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.push("/auth/welcome" as any)}
        >
          <Text className="text-white font-semibold">ログイン</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6">
        <View className="gap-6">
          {/* ヘッダー */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">アカウント</Text>
            <Text className="text-muted">プロフィール情報を管理</Text>
          </View>

          {/* ユーザー基本情報（表示のみ） */}
          <View className="gap-4">
            {/* アカウントID */}
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">アカウントID</Text>
              <Text className="text-base text-foreground font-mono">{user.uid}</Text>
            </View>

            {/* メールアドレス */}
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-xs text-muted mb-1">メールアドレス</Text>
              <Text className="text-base text-foreground">{user.email}</Text>
            </View>
          </View>

          {/* プロフィール情報 */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-foreground">プロフィール</Text>
              {!isEditing && (
                <Pressable onPress={() => setIsEditing(true)}>
                  <Text className="text-primary font-semibold">編集</Text>
                </Pressable>
              )}
            </View>

            {isEditing ? (
              <View className="gap-4">
                {/* 氏名 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">氏名</Text>
                  <TextInput
                    placeholder="山田太郎"
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    className="bg-surface rounded-lg p-3 text-foreground border border-border"
                    placeholderTextColor="#999"
                    editable={!isSaving}
                  />
                </View>

                {/* 年齢 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">年齢</Text>
                  <TextInput
                    placeholder="20"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                    keyboardType="number-pad"
                    className="bg-surface rounded-lg p-3 text-foreground border border-border"
                    placeholderTextColor="#999"
                    editable={!isSaving}
                  />
                </View>

                {/* 性別 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">性別</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "male", label: "男性" },
                      { value: "female", label: "女性" },
                      { value: "other", label: "その他" },
                      { value: "prefer_not_to_say", label: "回答しない" },
                    ].map((option) => (
                      <Pressable
                        key={option.value}
                        onPress={() => setFormData({ ...formData, gender: option.value })}
                        disabled={isSaving}
                        className={`flex-1 py-2 rounded-lg border ${
                          formData.gender === option.value
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                      >
                        <Text
                          className={`text-center text-xs font-semibold ${
                            formData.gender === option.value ? "text-white" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* 住所 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">住所</Text>
                  <TextInput
                    placeholder="東京都渋谷区"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                    className="bg-surface rounded-lg p-3 text-foreground border border-border"
                    placeholderTextColor="#999"
                    editable={!isSaving}
                  />
                </View>

                {/* 職業 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">職業</Text>
                  <TextInput
                    placeholder="学生 / 社会人"
                    value={formData.occupation}
                    onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                    className="bg-surface rounded-lg p-3 text-foreground border border-border"
                    placeholderTextColor="#999"
                    editable={!isSaving}
                  />
                </View>

                {/* ボタン */}
                <View className="flex-row gap-3 mt-2">
                  <Pressable
                    onPress={() => {
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          name: profile.name || "",
                          age: profile.age?.toString() || "",
                          gender: profile.gender || "prefer_not_to_say",
                          address: profile.address || "",
                          occupation: profile.occupation || "",
                        });
                      }
                    }}
                    disabled={isSaving}
                    className="flex-1 bg-surface py-3 rounded-lg border border-border active:opacity-70"
                  >
                    <Text className="text-center font-semibold text-foreground">キャンセル</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-primary py-3 rounded-lg active:opacity-70"
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-center font-semibold text-white">保存</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                {/* 氏名 */}
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">氏名</Text>
                  <Text className="text-base text-foreground">{profile?.name || "未設定"}</Text>
                </View>

                {/* 年齢 */}
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">年齢</Text>
                  <Text className="text-base text-foreground">{profile?.age || "未設定"}</Text>
                </View>

                {/* 性別 */}
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">性別</Text>
                  <Text className="text-base text-foreground">
                    {profile?.gender === "male"
                      ? "男性"
                      : profile?.gender === "female"
                        ? "女性"
                        : profile?.gender === "other"
                          ? "その他"
                          : "回答しない"}
                  </Text>
                </View>

                {/* 住所 */}
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">住所</Text>
                  <Text className="text-base text-foreground">{profile?.address || "未設定"}</Text>
                </View>

                {/* 職業 */}
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-xs text-muted mb-1">職業</Text>
                  <Text className="text-base text-foreground">{profile?.occupation || "未設定"}</Text>
                </View>
              </View>
            )}
          </View>

          {/* ログアウトボタン */}
          <Pressable
            onPress={handleLogout}
            className="bg-error/10 border border-error rounded-lg py-3 active:opacity-70"
          >
            <Text className="text-center font-semibold text-error">ログアウト</Text>
          </Pressable>

          <View className="h-8" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
