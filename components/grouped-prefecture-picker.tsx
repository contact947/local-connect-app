import { Modal, View, Text, Pressable, FlatList, SectionList, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

// 地方ごとの都道府県グループ
const PREFECTURE_GROUPS = [
  {
    region: "北海道",
    prefectures: ["北海道"],
  },
  {
    region: "東北",
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
  },
  {
    region: "関東",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
  },
  {
    region: "中部",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  },
  {
    region: "近畿",
    prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
  },
  {
    region: "中国",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  },
  {
    region: "四国",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
  },
  {
    region: "九州・沖縄",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
  },
];

interface GroupedPrefecturePickerProps {
  visible: boolean;
  selectedValue: string;
  onSelect: (prefecture: string) => void;
  onClose: () => void;
}

export function GroupedPrefecturePicker({
  visible,
  selectedValue,
  onSelect,
  onClose,
}: GroupedPrefecturePickerProps) {
  const colors = useColors();

  const sections = PREFECTURE_GROUPS.map((group) => ({
    title: group.region,
    data: group.prefectures.map((name) => ({ name, id: name })),
  }));

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="bg-background rounded-t-3xl max-h-4/5 flex-1"
          style={{ backgroundColor: colors.background }}
        >
          {/* ヘッダー */}
          <View className="border-b border-border p-6 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-foreground">都道府県を選択</Text>
            <Pressable onPress={onClose}>
              <Text className="text-2xl text-foreground">✕</Text>
            </Pressable>
          </View>

          {/* リスト */}
          <SectionList
            sections={sections}
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
                    "text-base",
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
            renderSectionHeader={({ section: { title } }) => (
              <View className="bg-surface px-6 py-3 border-b-2 border-border">
                <Text className="text-sm font-bold text-primary uppercase">{title}</Text>
              </View>
            )}
            stickySectionHeadersEnabled={true}
          />
        </View>
      </View>
    </Modal>
  );
}
