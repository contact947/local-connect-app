import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CameraView, Camera } from "expo-camera";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export function QRCodeScanner({ onScan, onCancel }: QRCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">カメラの許可を確認中...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-foreground text-center mb-4">
          カメラへのアクセスが許可されていません
        </Text>
        <TouchableOpacity className="bg-primary px-6 py-3 rounded-full" onPress={onCancel}>
          <Text className="text-background font-semibold">戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View className="flex-1 justify-between p-6">
        <View className="items-center mt-12">
          <Text className="text-white text-xl font-bold mb-2">QRコードをスキャン</Text>
          <Text className="text-white text-center">QRコードをカメラに映してください</Text>
        </View>
        <View className="items-center mb-12">
          <TouchableOpacity className="bg-surface px-8 py-4 rounded-full" onPress={onCancel}>
            <Text className="text-foreground font-semibold">キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
