import { View, TouchableOpacity, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  label: string;
  onImageSelected: (base64: string, fileName: string) => Promise<void>;
  isLoading?: boolean;
  previewUri?: string;
}

export function ImageUploadField({
  label,
  onImageSelected,
  isLoading = false,
  previewUri,
}: ImageUploadFieldProps) {
  const colors = useColors();
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [selectedUri, setSelectedUri] = useState<string | undefined>(previewUri);

  const convertToBase64 = async (uri: string): Promise<{ base64: string; fileName: string }> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      } as any);
      const fileName = uri.split('/').pop() || 'image.jpg';
      return { base64, fileName };
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  };

  const handlePickImage = async () => {
    try {
      setIsPickerLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedUri(uri);
        const { base64, fileName } = await convertToBase64(uri);
        await onImageSelected(base64, fileName);
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
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setSelectedUri(uri);
        const { base64, fileName } = await convertToBase64(uri);
        await onImageSelected(base64, fileName);
      }
    } catch (error) {
      Alert.alert('エラー', '写真の撮影に失敗しました');
      console.error('Error taking photo:', error);
    } finally {
      setIsPickerLoading(false);
    }
  };

  return (
    <View className="gap-3">
      {/* ラベル */}
      <Text className="text-sm font-semibold text-foreground">{label}</Text>

      {/* プレビュー */}
      {selectedUri && (
        <View className="w-full h-40 rounded-lg overflow-hidden bg-muted mb-2">
          <Image
            source={{ uri: selectedUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
          {(isLoading || isPickerLoading) && (
            <View className="absolute inset-0 bg-black/30 items-center justify-center">
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        </View>
      )}

      {/* ボタングループ */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={cn(
            'flex-1 py-3 rounded-lg items-center border border-primary',
            isLoading || isPickerLoading ? 'opacity-50' : ''
          )}
          onPress={handlePickImage}
          disabled={isLoading || isPickerLoading}
        >
          {isPickerLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className="text-primary font-semibold">ギャラリー</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className={cn(
            'flex-1 py-3 rounded-lg items-center border border-primary',
            isLoading || isPickerLoading ? 'opacity-50' : ''
          )}
          onPress={handleTakePhoto}
          disabled={isLoading || isPickerLoading}
        >
          {isPickerLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text className="text-primary font-semibold">カメラ</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
