import { View, Text, TouchableOpacity } from "react-native";
import { useScreenBrightness } from "@/hooks/use-screen-brightness";
import { QRCodeDisplay } from "./qr-code-display";
import { useColors } from "@/hooks/use-colors";

interface QRCodeDisplayScreenProps {
  qrCode: string;
  onClose: () => void;
}

/**
 * QRコード表示画面
 * 画面輝度を最大にしてQRコードを表示します
 */
export function QRCodeDisplayScreen({ qrCode, onClose }: QRCodeDisplayScreenProps) {
  const colors = useColors();
  
  // QRコード表示時に輝度を最大に
  useScreenBrightness();

  return (
    <View className="absolute inset-0 bg-black/90 items-center justify-center">
      <View className="gap-6 items-center">
        {/* タイトル */}
        <View className="gap-2 items-center">
          <Text className="text-2xl font-bold text-white">チケットコード</Text>
          <Text className="text-sm text-gray-300">このコードを店舗スタッフに提示してください</Text>
        </View>

        {/* QRコード */}
        <View className="bg-white p-6 rounded-2xl">
          <QRCodeDisplay value={qrCode} size={250} />
        </View>

        {/* コード表示 */}
        <View className="bg-white/10 px-4 py-3 rounded-lg">
          <Text className="text-xs text-white font-mono text-center">{qrCode}</Text>
        </View>

        {/* クローズボタン */}
        <TouchableOpacity
          onPress={onClose}
          className="bg-white px-8 py-3 rounded-full mt-4"
        >
          <Text className="text-black font-bold">完了</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
