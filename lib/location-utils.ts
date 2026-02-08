/**
 * GPS 位置情報関連のユーティリティ関数
 */

/**
 * 2つの座標間の距離をキロメートルで計算（Haversine 公式）
 * @param lat1 緯度1
 * @param lon1 経度1
 * @param lat2 緯度2
 * @param lon2 経度2
 * @returns 距離（km）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 度数をラジアンに変換
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 都道府県の代表座標を取得
 * @param prefectureName 都道府県名
 * @returns { latitude, longitude } または null
 */
export function getPrefectureCoordinates(
  prefectureName: string
): { latitude: number; longitude: number } | null {
  const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
    北海道: { latitude: 43.0642, longitude: 141.3469 },
    青森県: { latitude: 40.8245, longitude: 140.7361 },
    岩手県: { latitude: 39.6917, longitude: 141.1532 },
    宮城県: { latitude: 38.2688, longitude: 140.8721 },
    秋田県: { latitude: 39.7199, longitude: 140.1088 },
    山形県: { latitude: 38.2405, longitude: 140.3633 },
    福島県: { latitude: 37.7503, longitude: 140.4680 },
    茨城県: { latitude: 36.3426, longitude: 140.4470 },
    栃木県: { latitude: 36.5653, longitude: 139.8835 },
    群馬県: { latitude: 36.7394, longitude: 139.0577 },
    埼玉県: { latitude: 35.8617, longitude: 139.6455 },
    千葉県: { latitude: 35.6050, longitude: 140.1233 },
    東京都: { latitude: 35.6762, longitude: 139.6503 },
    神奈川県: { latitude: 35.4437, longitude: 139.6380 },
    新潟県: { latitude: 37.9026, longitude: 139.0328 },
    富山県: { latitude: 36.6955, longitude: 137.2113 },
    石川県: { latitude: 36.5944, longitude: 136.6256 },
    福井県: { latitude: 36.0641, longitude: 135.7348 },
    山梨県: { latitude: 35.6640, longitude: 138.5674 },
    長野県: { latitude: 36.7516, longitude: 138.2529 },
    岐阜県: { latitude: 35.3911, longitude: 136.7261 },
    静岡県: { latitude: 34.9949, longitude: 138.3830 },
    愛知県: { latitude: 35.1802, longitude: 136.9066 },
    三重県: { latitude: 34.7306, longitude: 136.5086 },
    滋賀県: { latitude: 35.0081, longitude: 135.8677 },
    京都府: { latitude: 35.0116, longitude: 135.7681 },
    大阪府: { latitude: 34.6937, longitude: 135.5023 },
    兵庫県: { latitude: 34.7405, longitude: 135.1955 },
    奈良県: { latitude: 34.3488, longitude: 135.8048 },
    和歌山県: { latitude: 33.7298, longitude: 135.5955 },
    鳥取県: { latitude: 35.5307, longitude: 134.2344 },
    島根県: { latitude: 35.4730, longitude: 132.5552 },
    岡山県: { latitude: 34.6619, longitude: 133.9344 },
    広島県: { latitude: 34.3996, longitude: 132.4596 },
    山口県: { latitude: 34.1858, longitude: 131.4745 },
    徳島県: { latitude: 34.0656, longitude: 134.6095 },
    香川県: { latitude: 34.3395, longitude: 134.0432 },
    愛媛県: { latitude: 33.8417, longitude: 132.7662 },
    高知県: { latitude: 33.5904, longitude: 133.3331 },
    福岡県: { latitude: 33.5904, longitude: 130.4017 },
    佐賀県: { latitude: 33.2490, longitude: 130.2996 },
    長崎県: { latitude: 32.7503, longitude: 129.8738 },
    熊本県: { latitude: 32.7897, longitude: 130.7410 },
    大分県: { latitude: 33.2381, longitude: 131.6126 },
    宮崎県: { latitude: 31.9111, longitude: 131.4230 },
    鹿児島県: { latitude: 31.5628, longitude: 130.5579 },
    沖縄県: { latitude: 26.2126, longitude: 127.6809 },
  };

  return coordinates[prefectureName] || null;
}

/**
 * 市区町村の代表座標を取得（簡易版）
 * 実装時は、より詳細な市区町村座標データベースを使用することを推奨
 */
export function getCityCoordinates(
  prefectureName: string,
  cityName: string
): { latitude: number; longitude: number } | null {
  // 簡易実装：都道府県の座標を返す
  // 本来は市区町村ごとの座標データベースが必要
  return getPrefectureCoordinates(prefectureName);
}
