import { View, TextInput, ScrollView, TouchableOpacity, Text } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Array<{ label: string; value: string }>;
  placeholder?: string;
}

/**
 * 検索とカテゴリフィルタリング用のコンポーネント
 * 検索バーとカテゴリボタンを提供
 */
export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  placeholder = "検索...",
}: SearchFilterBarProps) {
  const colors = useColors();

  return (
    <View className="gap-4">
      {/* 検索バー */}
      <View className="px-6">
        <TextInput
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-foreground"
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
      </View>

      {/* カテゴリフィルタ */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              className={cn(
                "px-4 py-2 rounded-full border",
                selectedCategory === category.value
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              )}
              onPress={() => onCategoryChange(category.value)}
            >
              <Text
                className={cn(
                  "font-semibold text-sm",
                  selectedCategory === category.value
                    ? "text-background"
                    : "text-foreground"
                )}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
