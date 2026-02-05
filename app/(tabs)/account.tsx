import { useState, useEffect } from "react";
import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";
import { startOAuthLogin } from "@/constants/oauth";

export default function AccountScreen() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch } = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "prefer_not_to_say" as "male" | "female" | "other" | "prefer_not_to_say",
    address: "",
    prefecture: "",
    city: "",
    schoolType: "other" as "high_school" | "university" | "working" | "other",
  });

  const createMutation = trpc.profile.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      Alert.alert("成功", "プロフィールを作成しました");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message);
    },
  });

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditing(false);
      Alert.alert("成功", "プロフィールを更新しました");
    },
    onError: (error) => {
      Alert.alert("エラー", error.message);
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age?.toString() || "",
        gender: profile.gender || "prefer_not_to_say",
        address: profile.address || "",
        prefecture: profile.prefecture || "",
        city: profile.city || "",
        schoolType: profile.schoolType || "other",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    const data = {
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender,
      address: formData.address || undefined,
      prefecture: formData.prefecture || undefined,
      city: formData.city || undefined,
      schoolType: formData.schoolType,
    };

    if (profile) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleLogout = async () => {
    Alert.alert("ログアウト", "ログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  if (authLoading || profileLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4">アカウント</Text>
        <Text className="text-muted text-center mb-6">ログインしてプロフィールを管理しましょう</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-full"
          onPress={() => router.push('/auth/welcome')}
        >
          <Text className="text-background font-semibold">ログイン</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 p-6">
        <View className="gap-6">
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-foreground">アカウント</Text>
          </View>

          {/* ユーザー基本情報 */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-2">アカウントID</Text>
            <Text className="text-base text-foreground font-mono">{user?.id}</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-2">名前</Text>
            <Text className="text-base text-foreground">{user?.name || "未設定"}</Text>
          </View>

          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted mb-2">メールアドレス</Text>
            <Text className="text-base text-foreground">{user?.email || "未設定"}</Text>
          </View>

          {/* プロフィール情報 */}
          <View className="mt-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-foreground">プロフィール</Text>
              {!isEditing && (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Text className="text-primary font-semibold">編集</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View className="gap-4">
                <View>
                  <Text className="text-sm text-muted mb-2">年齢</Text>
                  <TextInput
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    placeholder="年齢を入力"
                    placeholderTextColor="#687076"
                    keyboardType="number-pad"
                    value={formData.age}
                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">性別</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "male", label: "男性" },
                      { value: "female", label: "女性" },
                      { value: "other", label: "その他" },
                      { value: "prefer_not_to_say", label: "回答しない" },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`flex-1 py-3 rounded-xl border ${
                          formData.gender === option.value
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            gender: option.value as any,
                          })
                        }
                      >
                        <Text
                          className={`text-center font-semibold ${
                            formData.gender === option.value ? "text-background" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">都道府県</Text>
                  <TextInput
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    placeholder="例: 東京都"
                    placeholderTextColor="#687076"
                    value={formData.prefecture}
                    onChangeText={(text) => setFormData({ ...formData, prefecture: text })}
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">市区町村</Text>
                  <TextInput
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    placeholder="例: 渋谷区"
                    placeholderTextColor="#687076"
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">住所</Text>
                  <TextInput
                    className="bg-surface rounded-xl p-4 text-foreground border border-border"
                    placeholder="例: 東京都渋谷区"
                    placeholderTextColor="#687076"
                    value={formData.address}
                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                  />
                </View>

                <View>
                  <Text className="text-sm text-muted mb-2">学校区分</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "high_school", label: "高校生" },
                      { value: "university", label: "大学生" },
                      { value: "working", label: "社会人" },
                      { value: "other", label: "その他" },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        className={`flex-1 py-3 rounded-xl border ${
                          formData.schoolType === option.value
                            ? "bg-primary border-primary"
                            : "bg-surface border-border"
                        }`}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            schoolType: option.value as any,
                          })
                        }
                      >
                        <Text
                          className={`text-center font-semibold ${
                            formData.schoolType === option.value ? "text-background" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    className="flex-1 bg-surface py-3 rounded-xl border border-border"
                    onPress={() => {
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          age: profile.age?.toString() || "",
                          gender: profile.gender || "prefer_not_to_say",
                          address: profile.address || "",
                          prefecture: profile.prefecture || "",
                          city: profile.city || "",
                          schoolType: profile.schoolType || "other",
                        });
                      }
                    }}
                  >
                    <Text className="text-center font-semibold text-foreground">キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-primary py-3 rounded-xl"
                    onPress={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text className="text-center font-semibold text-background">保存</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="gap-4">
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-2">年齢</Text>
                  <Text className="text-base text-foreground">{profile?.age || "未設定"}</Text>
                </View>

                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-2">性別</Text>
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

                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-2">住所</Text>
                  <Text className="text-base text-foreground">{profile?.address || "未設定"}</Text>
                </View>

                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-sm text-muted mb-2">学校区分</Text>
                  <Text className="text-base text-foreground">
                    {profile?.schoolType === "high_school"
                      ? "高校生"
                      : profile?.schoolType === "university"
                        ? "大学生"
                        : profile?.schoolType === "working"
                          ? "社会人"
                          : "その他"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ログアウトボタン */}
          <TouchableOpacity
            className="bg-error py-4 rounded-xl mt-6"
            onPress={handleLogout}
          >
            <Text className="text-center font-semibold text-background">ログアウト</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
