import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * 画像ピッカーから画像を選択
 * @returns 選択された画像のURI、またはnull
 */
export async function pickImage(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
}

/**
 * カメラから画像を撮影
 * @returns 撮影された画像のURI、またはnull
 */
export async function takePhoto(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    throw error;
  }
}

/**
 * 画像ファイルをBase64に変換
 * @param uri 画像のURI
 * @returns Base64エンコードされた画像データ
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    } as any);
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * 画像ファイルをBlob形式に変換
 * @param uri 画像のURI
 * @returns Blob形式の画像データ
 */
export async function imageToBlob(uri: string): Promise<any> {
  try {
    const base64 = await imageToBase64(uri);
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: 'image/jpeg' });
  } catch (error) {
    console.error('Error converting image to blob:', error);
    throw error;
  }
}

/**
 * 画像ファイルをFormDataに追加
 * @param formData FormDataオブジェクト
 * @param uri 画像のURI
 * @param fieldName フォームフィールド名
 * @param fileName ファイル名
 */
export async function addImageToFormData(
  formData: FormData,
  uri: string,
  fieldName: string = 'image',
  fileName: string = 'image.jpg'
): Promise<void> {
  try {
    const base64 = await imageToBase64(uri);
    const blob = new Blob(
      [Uint8Array.from(atob(base64), c => c.charCodeAt(0))],
      { type: 'image/jpeg' }
    );
    formData.append(fieldName, blob, fileName);
  } catch (error) {
    console.error('Error adding image to form data:', error);
    throw error;
  }
}

/**
 * 画像をサーバーにアップロード
 * @param uri 画像のURI
 * @param uploadUrl アップロード先URL
 * @param fieldName フォームフィールド名
 * @returns アップロード結果
 */
export async function uploadImage(
  uri: string,
  uploadUrl: string,
  fieldName: string = 'image'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    await addImageToFormData(formData, uri, fieldName);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      url: result.url || result.imageUrl,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
