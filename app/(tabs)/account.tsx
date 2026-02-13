import { useState, useEffect } from "react";
import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator, Alert, Share, Modal, FlatList, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";
import { getUserProfileFromFirestore, updateUserProfileInFirestore } from "@/lib/firestore-utils";
import prefecturesData from "@/constants/prefectures.json";
import { extractPrefectureFromAddress, getCitiesByPrefectureName } from "@/types/prefecture";
import * as Clipboard from "expo-clipboard";
import { GroupedPrefecturePicker } from "@/components/grouped-prefecture-picker";
import { CityPicker } from "@/components/city-picker";

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
    prefecture: "",
    city: "",
    occupation: "",
  });
  const [showPrefectureModal, setShowPrefectureModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [availableCities, setAvailableCities] = useState<any[]>([]);

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
          // 住所から都道府県と市区町村を抽出
          const address = data.address || "";
          const prefecture = extractPrefectureFromAddress(address) || "";
          const city = address.replace(prefecture, "").trim() || "";

          setFormData({
            name: data.name || "",
            age: data.age?.toString() || "",
            gender: data.gender || "prefer_not_to_say",
            prefecture: prefecture,
            city: city,
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

  // 都道府県選択時に市区町村を更新
  useEffect(() => {
    if (formData.prefecture) {
      const cities = getCitiesByPrefectureName(prefecturesData.prefectures, formData.prefecture);
      setAvailableCities(cities);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.prefecture]);

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("コピーしました", "クリップボードにコピーされました");
  };

  const handleSave = async () => {
    if (!user) return;

    if (!formData.name.trim()) {
      Alert.alert("エラー", "氏名を入力してください");
      return;
    }

    if (!formData.prefecture) {
      Alert.alert("エラー", "都道府県を選択してください");
      return;
    }

    if (!formData.city) {
      Alert.alert("エラー", "市区町村を選択してください");
      return;
    }

    setIsSaving(true);
    try {
      const fullAddress = `${formData.prefecture}${formData.city}`;
      const updateData = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as "male" | "female" | "other" | "prefer_not_to_say",
        address: fullAddress,
        occupation: formData.occupation.trim(),
      };

      console.log("Updating profile with data:", updateData);
      await updateUserProfileInFirestore(user.uid, updateData);

      const updatedData = await getUserProfileFromFirestore(user.uid);
      if (updatedData) {
        setProfile(updatedData);
        setIsEditing(false);
        Alert.alert("成功", "プロフィールを更新しました");
      } else {
        Alert.alert("警告", "プロフィールは更新されましたが、再取得に失敗しました");
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      const errorMessage = error?.message || "プロフィール更新に失敗しました";
      Alert.alert("エラー", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      const address = profile.address || "";
      const prefecture = extractPrefectureFromAddress(address) || "";
      const city = address.replace(prefecture, "").trim() || "";

      setFormData({
        name: profile.name || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "prefer_not_to_say",
        prefecture: prefecture,
        city: city,
        occupation: profile.occupation || "",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/welcome" as any);
    } catch (error) {
      Alert.alert("エラー", "ログアウトに失敗しました");
      console.error(error);
    }
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
            {/* アカウントID - 長押しでコピー */}
            <Pressable
              onLongPress={() => handleCopyToClipboard(user.uid)}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-xs text-muted mb-1">アカウントID</Text>
              <Text className="text-base text-foreground font-mono">{user.uid}</Text>
              <Text className="text-xs text-muted mt-2">長押しでコピー</Text>
            </Pressable>

            {/* メールアドレス - 長押しでコピー */}
            <Pressable
              onLongPress={() => handleCopyToClipboard(user.email || "")}
              className="bg-surface rounded-lg p-4 border border-border active:opacity-70"
            >
              <Text className="text-xs text-muted mb-1">メールアドレス</Text>
              <Text className="text-base text-foreground">{user.email}</Text>
              <Text className="text-xs text-muted mt-2">長押しでコピー</Text>
            </Pressable>
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

                {/* 性別 - ボタン選択式 */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">性別</Text>
                  <View className="flex-row gap-2">
                    {[
                      { value: "male", label: "男性" },
                      { value: "female", label: "女性" },
                      { value: "other", label: "その他" },
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
                          className={`text-center text-sm font-semibold ${
                            formData.gender === option.value ? "text-white" : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* 都道府県 - プルダウン */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">都道府県</Text>
                  <Pressable
                    onPress={() => setShowPrefectureModal(true)}
                    disabled={isSaving}
                    className="bg-surface rounded-lg p-3 border border-border flex-row justify-between items-center active:opacity-70"
                  >
                    <Text className={formData.prefecture ? "text-foreground" : "text-muted"}>
                      {formData.prefecture || "選択してください"}
                    </Text>
                    <Text className="text-foreground">▼</Text>
                  </Pressable>
                </View>

                {/* 市区町村 - プルダウン */}
                <View className="gap-2">
                  <Text className="text-sm text-muted font-semibold">市区町村</Text>
                  <Pressable
                    onPress={() => setShowCityModal(true)}
                    disabled={isSaving || !formData.prefecture}
                    className={`bg-surface rounded-lg p-3 border flex-row justify-between items-center active:opacity-70 ${
                      formData.prefecture ? "border-border" : "border-border opacity-50"
                    }`}
                  >
                    <Text className={formData.city ? "text-foreground" : "text-muted"}>
                      {formData.city || "都道府県を選択してください"}
                    </Text>
                    <Text className="text-foreground">▼</Text>
                  </Pressable>
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
                    onPress={handleCancel}
                    disabled={isSaving}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-surface py-3 rounded-lg border border-border"
                  >
                    <Text className="text-center font-semibold text-foreground">キャンセル</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    disabled={isSaving}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                    className="flex-1 bg-primary py-3 rounded-lg"
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
                          : "未設定"}
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
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            className="bg-error/10 border border-error rounded-lg py-3"
          >
            <Text className="text-center font-semibold text-error">ログアウト</Text>
          </Pressable>

          <View className="h-8" />
        </View>
      </ScrollView>

      {/* 都道府県選択モーダル */}
      <GroupedPrefecturePicker
        visible={showPrefectureModal}
        selectedValue={formData.prefecture}
        onSelect={(prefecture) => setFormData({ ...formData, prefecture })}
        onClose={() => setShowPrefectureModal(false)}
      />

      {/* 市区町村選択モーダル */}
      <CityPicker
        visible={showCityModal}
        selectedValue={formData.city}
        cities={availableCities}
        onSelect={(city) => setFormData({ ...formData, city })}
        onClose={() => setShowCityModal(false)}
      />
    </ScreenContainer>
  );
}
