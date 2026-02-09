# Android パーミッション設定ガイド

## 概要

Expoプロジェクトでは、`app.config.ts` でAndroidパーミッションを設定します。このガイドでは、インターネット権限の確認と設定方法を説明します。

## 現在の設定確認

### 1. app.config.ts の確認

プロジェクトルートの `app.config.ts` ファイルを開き、以下の部分を確認してください：

```typescript
android: {
  adaptiveIcon: {
    backgroundColor: "#E6F4FE",
    foregroundImage: "./assets/images/android-icon-foreground.png",
    backgroundImage: "./assets/images/android-icon-background.png",
    monochromeImage: "./assets/images/android-icon-monochrome.png",
  },
  edgeToEdgeEnabled: true,
  predictiveBackGestureEnabled: false,
  package: env.androidPackage,
  permissions: ["POST_NOTIFICATIONS"],  // ← ここを確認
  // ...
}
```

### 2. インターネット権限の追加

Firebaseなどのネットワーク機能を使用する場合、`permissions` 配列に `"INTERNET"` を追加してください：

```typescript
android: {
  // ... 他の設定 ...
  permissions: [
    "INTERNET",              // ← インターネット接続に必要
    "POST_NOTIFICATIONS",    // プッシュ通知に必要
    "ACCESS_NETWORK_STATE",  // ネットワーク状態確認に必要（オプション）
  ],
  // ...
}
```

## 必要なパーミッション一覧

| パーミッション | 用途 | 必須 |
|---|---|---|
| `INTERNET` | インターネット接続（Firebase、API呼び出しなど） | ✅ 必須 |
| `POST_NOTIFICATIONS` | プッシュ通知の送信 | 通知機能を使う場合 |
| `ACCESS_NETWORK_STATE` | ネットワーク状態の確認 | オプション |
| `ACCESS_FINE_LOCATION` | 正確な位置情報取得 | 位置情報機能を使う場合 |
| `ACCESS_COARSE_LOCATION` | 大まかな位置情報取得 | 位置情報機能を使う場合 |
| `CAMERA` | カメラアクセス | カメラ機能を使う場合 |
| `READ_EXTERNAL_STORAGE` | 外部ストレージ読み取り | ファイル選択機能を使う場合 |
| `WRITE_EXTERNAL_STORAGE` | 外部ストレージ書き込み | ファイル保存機能を使う場合 |

## ビルド時の確認

### Expo Go でのテスト

1. `pnpm dev` でメトロバンドラーを起動
2. QRコードをスキャンして Expo Go で開く
3. 初回起動時にパーミッション許可を求めるダイアログが表示されます

### ネイティブビルド時

```bash
# iOS ビルド
eas build --platform ios

# Android ビルド
eas build --platform android
```

ビルド時に `app.config.ts` のパーミッション設定が自動的に `AndroidManifest.xml` に反映されます。

## オフラインエラー対応

### ネットワーク接続確認

オフラインエラーを適切に処理するために、以下のコードを使用してネットワーク接続を確認できます：

```typescript
import NetInfo from '@react-native-community/netinfo';

// ネットワーク状態を確認
const state = await NetInfo.fetch();
if (state.isConnected) {
  // オンライン処理
} else {
  // オフライン処理（キャッシュから取得など）
}
```

### Firebaseのオフラインハンドリング

本プロジェクトでは、以下のファイルでオフラインハンドリングを実装しています：

- `lib/firestore-utils.ts` - Firestore操作のキャッシュ機能
- `hooks/use-firebase-auth-modular.ts` - 認証処理のキャッシュ機能

これらのファイルは、ネットワークエラー時に `AsyncStorage` を使用してローカルキャッシュから データを取得します。

## トラブルシューティング

### パーミッションエラーが表示される場合

1. `app.config.ts` の `permissions` 配列を確認
2. 必要なパーミッションが含まれているか確認
3. `pnpm dev` を再実行してメトロバンドラーを再起動
4. Expo Go を再起動

### ネットワークに接続できない場合

1. デバイスのWi-Fi/モバイルデータが有効か確認
2. ファイアウォール設定を確認
3. Firebase プロジェクトのセキュリティルールを確認

## 参考リンク

- [Expo ドキュメント - Android Permissions](https://docs.expo.dev/guides/permissions/)
- [Firebase セキュリティルール](https://firebase.google.com/docs/firestore/security/start)
- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)
