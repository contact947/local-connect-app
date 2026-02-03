# LocalConnect - 地域密着型モバイルアプリ

## プロジェクト概要

**LocalConnect**は、若者（高校生・大学生・新社会人）が地域の店舗・イベント・人と自然につながれる地域密着型モバイルアプリケーションです。地域メディア機能、イベントチケット管理、ギフト機能を統合し、地域コミュニティの活性化を支援します。

### ターゲットユーザー

- **年齢層**: 17〜24歳（高校生・大学生・新社会人）およびその保護者
- **利用シーン**: 地元のイベント探し、商店街や店舗のお得情報の確認、音楽イベント・地域イベントへの参加
- **ITリテラシー**: 高くないユーザーも想定した直感的なUI設計

### 主要機能

LocalConnectは以下の4つの主要機能を提供します。

#### 1. 地域メディア機能

地域の店舗取材記事やブログ記事を閲覧できる機能です。管理者が記事を投稿・編集し、ユーザーは自分の地域に関連する情報を簡単に見つけることができます。

**特徴:**
- カテゴリ分け（店舗・イベント・インタビュー・コラム・その他）
- 地域フィルター（都道府県・市区町村）
- 閲覧数トラッキング
- 画像付き記事表示

#### 2. イベントチケット機能

地域のイベント情報を閲覧し、チケットを購入（モック決済）できる機能です。購入したチケットはQRコードとして発行され、イベント入場時に使用できます。

**特徴:**
- イベント一覧表示（地域フィルター対応）
- チケット購入フロー（モック決済）
- QRコードチケット発行
- 参加予定イベント管理
- チケット使用状況管理

#### 3. ギフト機能

GPS位置情報を活用し、近くの店舗で使えるギフト（クーポン）を表示する機能です。年齢や学校区分による表示制御、使用回数制限などの細かな設定が可能です。

**特徴:**
- GPS位置情報ベースの近隣ギフト表示
- 距離計算と並び替え
- 年齢制限・学校区分制限
- 使用回数制限
- 有効期限管理
- ギフト使用履歴トラッキング

#### 4. ユーザー認証・アカウント管理

Manus-OAuthを使用した安全な認証システムと、ユーザープロフィール管理機能を提供します。

**特徴:**
- OAuth認証（Manus-OAuth連携）
- プロフィール情報管理（名前、年齢、性別、住所）
- アカウントID自動付番
- プロフィール編集機能

---

## 技術スタック

LocalConnectは最新のモバイルアプリ開発技術を採用しています。

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Expo** | SDK 54 | React Nativeアプリケーションフレームワーク |
| **React Native** | 0.81 | クロスプラットフォームモバイルアプリ開発 |
| **TypeScript** | 5.9 | 型安全な開発環境 |
| **Expo Router** | 6 | ファイルベースルーティング |
| **NativeWind** | 4 | Tailwind CSSスタイリング |
| **TanStack Query** | 5 | サーバーステート管理 |
| **tRPC** | 11 | 型安全なAPI通信 |

### バックエンド

| 技術 | 用途 |
|------|------|
| **Node.js** | サーバーランタイム |
| **Express** | Webアプリケーションフレームワーク |
| **Drizzle ORM** | データベースORM |
| **MySQL/TiDB** | リレーショナルデータベース |
| **tRPC** | 型安全なAPIエンドポイント |
| **Manus-OAuth** | 認証システム |

### ネイティブ機能

| パッケージ | 用途 |
|-----------|------|
| **expo-location** | GPS位置情報取得 |
| **expo-camera** | QRコードスキャン |
| **react-native-qrcode-svg** | QRコード生成 |
| **expo-image** | 画像表示・キャッシング |

---

## ディレクトリ構成

プロジェクトは以下のディレクトリ構成で整理されています。

```
local-connect-app/
├── app/                          # アプリケーション画面
│   ├── (tabs)/                   # タブナビゲーション
│   │   ├── _layout.tsx           # タブレイアウト設定
│   │   ├── index.tsx             # ホーム画面
│   │   ├── news.tsx              # ニュース画面
│   │   ├── events.tsx            # イベント画面
│   │   ├── gifts.tsx             # ギフト画面
│   │   └── account.tsx           # アカウント画面
│   ├── _layout.tsx               # ルートレイアウト
│   └── oauth/                    # OAuth認証コールバック
│       └── callback.tsx
│
├── components/                   # 再利用可能なコンポーネント
│   ├── screen-container.tsx      # SafeArea対応コンテナ
│   ├── qr-code-display.tsx       # QRコード表示コンポーネント
│   ├── qr-code-scanner.tsx       # QRコードスキャナー
│   ├── haptic-tab.tsx            # ハプティックフィードバック付きタブ
│   ├── themed-view.tsx           # テーマ対応View
│   └── ui/
│       └── icon-symbol.tsx       # アイコンマッピング
│
├── server/                       # バックエンドサーバー
│   ├── routers.ts                # tRPC APIルーター
│   ├── db.ts                     # データベースクエリヘルパー
│   ├── README.md                 # サーバードキュメント
│   └── _core/                    # サーバーコア機能
│
├── drizzle/                      # データベース関連
│   └── schema.ts                 # データベーススキーマ定義
│
├── hooks/                        # カスタムフック
│   ├── use-auth.ts               # 認証状態管理
│   ├── use-colors.ts             # テーマカラー取得
│   └── use-color-scheme.ts       # ダークモード検出
│
├── lib/                          # ユーティリティライブラリ
│   ├── trpc.ts                   # tRPCクライアント設定
│   ├── utils.ts                  # 汎用ユーティリティ
│   └── theme-provider.tsx        # テーマプロバイダー
│
├── constants/                    # 定数定義
│   └── theme.ts                  # テーマカラー定義
│
├── assets/                       # 静的アセット
│   └── images/                   # 画像ファイル
│       ├── icon.png              # アプリアイコン
│       ├── splash-icon.png       # スプラッシュ画面アイコン
│       ├── favicon.png           # Webファビコン
│       └── android-icon-*.png    # Android用アイコン
│
├── scripts/                      # ユーティリティスクリプト
│   └── seed-data.ts              # テストデータ投入スクリプト
│
├── app.config.ts                 # Expo設定ファイル
├── tailwind.config.js            # Tailwind CSS設定
├── theme.config.js               # テーマカラー設定
├── package.json                  # 依存関係定義
├── tsconfig.json                 # TypeScript設定
├── design.md                     # UI/UX設計ドキュメント
├── todo.md                       # タスク管理
└── DOCUMENTATION.md              # 本ドキュメント
```

---

## データベース設計

LocalConnectは以下のテーブル構成でデータを管理しています。

### テーブル一覧

#### 1. users（ユーザー）

ユーザーの基本情報を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | ユーザーID |
| name | VARCHAR | ユーザー名 |
| age | INT | 年齢 |
| gender | ENUM | 性別（male/female/other/prefer_not_to_say） |
| prefecture | VARCHAR | 都道府県 |
| city | VARCHAR | 市区町村 |
| schoolType | ENUM | 学校区分（high_school/university/working/other） |
| createdAt | TIMESTAMP | 作成日時 |
| updatedAt | TIMESTAMP | 更新日時 |

#### 2. articles（ニュース記事）

地域メディアの記事情報を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | 記事ID |
| title | VARCHAR | タイトル |
| content | TEXT | 本文 |
| category | ENUM | カテゴリ（store/event/interview/column/other） |
| prefecture | VARCHAR | 都道府県 |
| city | VARCHAR | 市区町村 |
| imageUrl | VARCHAR | 画像URL |
| viewCount | INT | 閲覧数 |
| publishedAt | TIMESTAMP | 公開日時 |
| createdAt | TIMESTAMP | 作成日時 |

#### 3. events（イベント）

イベント情報を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | イベントID |
| title | VARCHAR | タイトル |
| description | TEXT | 説明 |
| eventDate | TIMESTAMP | 開催日時 |
| venue | VARCHAR | 会場 |
| price | DECIMAL | 価格 |
| prefecture | VARCHAR | 都道府県 |
| city | VARCHAR | 市区町村 |
| imageUrl | VARCHAR | 画像URL |
| capacity | INT | 定員 |
| availableTickets | INT | 残りチケット数 |
| createdAt | TIMESTAMP | 作成日時 |

#### 4. tickets（チケット）

購入されたチケット情報を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | チケットID |
| userId | INT (FK) | ユーザーID |
| eventId | INT (FK) | イベントID |
| qrCode | VARCHAR | QRコード文字列 |
| quantity | INT | 枚数 |
| isUsed | BOOLEAN | 使用済みフラグ |
| usedAt | TIMESTAMP | 使用日時 |
| purchasedAt | TIMESTAMP | 購入日時 |

#### 5. gifts（ギフト）

店舗が提供するギフト（クーポン）情報を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | ギフトID |
| storeName | VARCHAR | 店舗名 |
| giftTitle | VARCHAR | ギフトタイトル |
| description | TEXT | 説明 |
| latitude | DECIMAL | 緯度 |
| longitude | DECIMAL | 経度 |
| address | VARCHAR | 住所 |
| prefecture | VARCHAR | 都道府県 |
| city | VARCHAR | 市区町村 |
| imageUrl | VARCHAR | 画像URL |
| expiryDate | TIMESTAMP | 有効期限 |
| usageLimit | INT | 使用回数制限 |
| ageRestriction | INT | 年齢制限 |
| schoolTypeRestriction | ENUM | 学校区分制限 |
| createdAt | TIMESTAMP | 作成日時 |

#### 6. giftUsages（ギフト使用履歴）

ユーザーのギフト使用履歴を管理するテーブルです。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | INT (PK) | 使用履歴ID |
| userId | INT (FK) | ユーザーID |
| giftId | INT (FK) | ギフトID |
| usedAt | TIMESTAMP | 使用日時 |

---

## API設計

LocalConnectのバックエンドAPIは、tRPCを使用して型安全に実装されています。

### API一覧

#### プロフィール関連

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `profile.get` | Query | ログインユーザーのプロフィール取得 |
| `profile.update` | Mutation | プロフィール情報更新 |

#### 記事関連

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `articles.list` | Query | 記事一覧取得（地域・カテゴリフィルター対応） |
| `articles.get` | Query | 記事詳細取得 |

#### イベント関連

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `events.list` | Query | イベント一覧取得（地域フィルター対応） |
| `events.get` | Query | イベント詳細取得 |

#### チケット関連

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `tickets.purchase` | Mutation | チケット購入（モック決済） |
| `tickets.myTickets` | Query | 自分のチケット一覧取得 |
| `tickets.use` | Mutation | チケット使用（QRコード検証） |

#### ギフト関連

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `gifts.nearby` | Query | 近隣ギフト一覧取得（GPS位置情報ベース） |
| `gifts.use` | Mutation | ギフト使用 |

---

## 主要機能のサンプルコード

### 1. GPS位置情報を使用した近隣ギフト取得

ギフトタブ画面では、ユーザーの現在位置を取得し、近くの店舗で使えるギフトを表示します。

```typescript
// app/(tabs)/gifts.tsx
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { trpc } from "@/lib/trpc";

export default function GiftsScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  const { data: nearbyGifts } = trpc.gifts.nearby.useQuery(
    {
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      limit: 20,
    },
    { enabled: !!location }
  );

  // UI rendering...
}
```

### 2. QRコード生成とスキャン

チケットやギフトのQRコード生成・スキャン機能を提供します。

```typescript
// components/qr-code-display.tsx
import QRCode from "react-native-qrcode-svg";

export function QRCodeDisplay({ value, size = 250 }: { value: string; size?: number }) {
  return (
    <View className="items-center">
      <QRCode value={value} size={size} />
    </View>
  );
}
```

```typescript
// components/qr-code-scanner.tsx
import { CameraView, Camera } from "expo-camera";

export function QRCodeScanner({ onScan }: { onScan: (data: string) => void }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  return (
    <CameraView
      onBarcodeScanned={({ data }) => onScan(data)}
      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
    />
  );
}
```

### 3. 型安全なAPI通信（tRPC）

tRPCを使用することで、フロントエンドとバックエンド間で型安全な通信を実現しています。

```typescript
// server/routers.ts
export const appRouter = router({
  articles: router({
    list: publicProcedure
      .input(
        z.object({
          prefecture: z.string().optional(),
          city: z.string().optional(),
          category: z.enum(["store", "event", "interview", "column", "other"]).optional(),
          limit: z.number().default(10),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getArticles(input);
      }),
  }),
  // ... other routers
});
```

```typescript
// app/(tabs)/news.tsx
import { trpc } from "@/lib/trpc";

export default function NewsScreen() {
  const { data: articles } = trpc.articles.list.useQuery({
    category: "event",
    limit: 20,
  });
  // 型安全にarticlesを使用可能
}
```

---

## テストデータの投入

開発・テスト用のサンプルデータを簡単に投入できるスクリプトを用意しています。

```bash
# テストデータ投入
npx tsx scripts/seed-data.ts
```

このスクリプトは以下のデータを投入します:

- **記事**: 5件（店舗・イベント・インタビュー・コラム・その他）
- **イベント**: 3件（音楽フェス・ストリートマーケット・グルメフェスティバル）
- **ギフト**: 4件（カフェ・ラーメン店・たこ焼き店・ブックカフェ）

---

## 開発・デプロイ手順

### 開発環境のセットアップ

```bash
# 依存関係のインストール
pnpm install

# データベースマイグレーション
pnpm db:push

# テストデータ投入
npx tsx scripts/seed-data.ts

# 開発サーバー起動
pnpm dev
```

### Expo Goでの動作確認

1. スマートフォンに**Expo Go**アプリをインストール
2. 開発サーバー起動後に表示されるQRコードをスキャン
3. アプリが起動し、実機で動作確認可能

### デプロイ

1. Management UIの**Publish**ボタンをクリック
2. アプリがビルドされ、デプロイ可能な状態になります

---

## 今後の拡張アイデア

LocalConnectは以下の機能拡張が可能です。

### 1. プッシュ通知機能

イベント開催前日や新しいギフトが追加されたときに、ユーザーにプッシュ通知を送信する機能を追加できます。`expo-notifications`パッケージを使用して実装可能です。

### 2. ソーシャルログイン

Google、Apple、LINEなどのソーシャルログインを追加することで、ユーザー登録のハードルを下げることができます。

### 3. イベントレビュー・評価機能

参加したイベントに対してレビューや評価を投稿できる機能を追加し、ユーザー間の情報共有を促進できます。

### 4. チャット・コミュニティ機能

地域ごとのコミュニティチャットルームを作成し、ユーザー同士が交流できる場を提供できます。

### 5. 管理者ダッシュボード

記事やイベント、ギフトを管理するためのWeb管理画面を追加し、運営者が簡単にコンテンツを管理できるようにします。

### 6. 決済機能の実装

現在はモック決済ですが、Stripeなどの決済サービスを統合することで、実際の課金機能を実装できます。

### 7. 多言語対応

外国人観光客向けに英語や中国語などの多言語対応を追加することで、利用者層を拡大できます。

### 8. AI推薦機能

ユーザーの行動履歴や興味関心に基づいて、おすすめのイベントやギフトを提案するAI推薦機能を追加できます。

---

## まとめ

**LocalConnect**は、若者が地域と自然につながれるモバイルアプリケーションとして設計されました。Expo + React Native + TypeScriptの最新技術スタックを採用し、型安全で保守性の高いコードベースを実現しています。

地域メディア、イベントチケット、ギフト機能を統合することで、地域コミュニティの活性化に貢献します。今後の機能拡張により、さらに多様なユーザーニーズに応えることが可能です。

---

**作成者**: Manus AI  
**作成日**: 2026年2月4日  
**バージョン**: 1.0.0
