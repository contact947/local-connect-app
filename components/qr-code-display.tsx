import { View, Text } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
}

export function QRCodeDisplay({ value, size = 250, title, subtitle }: QRCodeDisplayProps) {
  return (
    <View className="items-center gap-4">
      {title && <Text className="text-xl font-bold text-foreground text-center">{title}</Text>}
      {subtitle && <Text className="text-muted text-center">{subtitle}</Text>}
      <View className="bg-white p-6 rounded-2xl">
        <QRCode value={value} size={size} />
      </View>
      <Text className="text-muted text-xs font-mono text-center">{value}</Text>
    </View>
  );
}
