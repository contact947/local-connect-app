/**
 * 都道府県・市区町村の型定義
 */

export interface City {
  id: number;
  name: string;
}

export interface Prefecture {
  id: number;
  name: string;
  code: string;
  cities: City[];
}

export interface PrefecturesData {
  prefectures: Prefecture[];
}

/**
 * 都道府県名から Prefecture オブジェクトを取得
 */
export function getPrefectureByName(
  prefectures: Prefecture[],
  name: string
): Prefecture | undefined {
  return prefectures.find((p) => p.name === name);
}

/**
 * 都道府県 ID から Prefecture オブジェクトを取得
 */
export function getPrefectureById(
  prefectures: Prefecture[],
  id: number
): Prefecture | undefined {
  return prefectures.find((p) => p.id === id);
}

/**
 * 都道府県名から市区町村リストを取得
 */
export function getCitiesByPrefectureName(
  prefectures: Prefecture[],
  prefectureName: string
): City[] {
  const prefecture = getPrefectureByName(prefectures, prefectureName);
  return prefecture?.cities || [];
}

/**
 * 住所文字列から都道府県名を抽出
 * 例: "東京都渋谷区" → "東京都"
 */
export function extractPrefectureFromAddress(address: string): string | null {
  const prefectureNames = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ];

  for (const prefName of prefectureNames) {
    if (address.startsWith(prefName)) {
      return prefName;
    }
  }

  return null;
}
