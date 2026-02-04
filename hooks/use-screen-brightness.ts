import { useEffect } from "react";
import * as Brightness from "expo-brightness";
import { Platform } from "react-native";

/**
 * QRコード表示時に画面輝度を最大にするカスタムフック
 * コンポーネントがマウント時に輝度を最大に、アンマウント時に元に戻す
 */
export function useScreenBrightness() {
  useEffect(() => {
    // ネイティブプラットフォームのみで実行
    if (Platform.OS === "web") return;

    let previousBrightness: number | null = null;

    (async () => {
      try {
        // 現在の輝度を保存
        previousBrightness = await Brightness.getBrightnessAsync();
        // 輝度を最大に設定
        await Brightness.setBrightnessAsync(1);
      } catch (error) {
        console.error("Failed to set brightness:", error);
      }
    })();

    // クリーンアップ: 元の輝度に戻す
    return () => {
      if (previousBrightness !== null) {
        (async () => {
          try {
            await Brightness.setBrightnessAsync(previousBrightness);
          } catch (error) {
            console.error("Failed to restore brightness:", error);
          }
        })();
      }
    };
  }, []);
}
