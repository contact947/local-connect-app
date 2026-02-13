import { View, TouchableOpacity, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface ProfileImagePickerProps {
  currentImageUrl?: string;
  onImageSelected: (uri: string) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileImagePicker({
  currentImageUrl,
  onImageSelected,
  isLoading = false,
}: ProfileImagePickerProps) {
  const colors = useColors();
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      setIsPickerLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await onImageSelected(uri);
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
      console.error('Error picking image:', error);
    } finally {
      setIsPickerLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setIsPickerLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await onImageSelected(uri);
      }
    } catch (error) {
      Alert.alert('エラー', '写真の撮影に失敗しました');
      console.error('Error taking photo:', error);
    } finally {
      setIsPickerLoading(false);
    }
  };

  return (
    <View className="items-center gap-4">
      {/* プロフィール画像表示 */}
      <View className="relative">
        <View
          className="w-24 h-24 rounded-full bg-surface border-2 border-border items-center justify-center overflow-hidden"
          style={{ borderColor: colors.border }}
        >
          {currentImageUrl ? (
            <Image
              source={{ uri: currentImageUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-4xl">📷</Text>
          )}
        </View>

        {/* ローディング表示 */}
        {(isLoading || isPickerLoading) && (
          <View className="absolute inset-0 rounded-full bg-black/30 items-center justify-center">
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        )}
      </View>

      {/* ボタングループ */}
      <View className="w-full gap-3">
        <TouchableOpacity
          className={cn(
            'py-3 rounded-lg items-center border border-primary',
            isLoading || isPickerLoading ? 'opacity-50' : ''
          )}
          onPress={handlePickImage}
          disabled={isLoading || isPickerLoading}
        >
          <Text className="text-primary font-semibold">ギャラリーから選択</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={cn(
            'py-3 rounded-lg items-center border border-primary',
            isLoading || isPickerLoading ? 'opacity-50' : ''
          )}
          onPress={handleTakePhoto}
          disabled={isLoading || isPickerLoading}
        >
          <Text className="text-primary font-semibold">カメラで撮影</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
