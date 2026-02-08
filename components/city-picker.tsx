import { Modal, View, Text, Pressable, FlatList } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface CityPickerProps {
  visible: boolean;
  selectedValue: string;
  cities: Array<{ id: string; name: string }>;
  onSelect: (city: string) => void;
  onClose: () => void;
}

export function CityPicker({
  visible,
  selectedValue,
  cities,
  onSelect,
  onClose,
}: CityPickerProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-background rounded-t-3xl max-h-4/5 flex-1"
          style={{ backgroundColor: colors.background }}
        >
          {/* ヘッダー */}
          <View className="border-b border-border p-6 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-foreground">市区町村を選択</Text>
            <Pressable onPress={onClose}>
              <Text className="text-2xl text-foreground">✕</Text>
            </Pressable>
          </View>

          {/* リスト */}
          <FlatList
            data={cities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item.name);
                  onClose();
                }}
                className={cn(
                  "px-6 py-4 flex-row justify-between items-center border-b border-border",
                  selectedValue === item.name && "bg-primary/10"
                )}
              >
                <Text
                  className={cn(
                    "text-base flex-1",
                    selectedValue === item.name ? "text-primary font-semibold" : "text-foreground"
                  )}
                >
                  {item.name}
                </Text>
                {selectedValue === item.name && (
                  <Text className="text-primary text-lg font-bold">✓</Text>
                )}
              </Pressable>
            )}
            scrollEnabled={true}
          />
        </View>
      </View>
    </Modal>
  );
}
