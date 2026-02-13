# 画像データ移行ガイド

このドキュメントでは、既存のURL形式の画像データを新しいBase64形式のストレージに移行するプロセスを説明します。

## 概要

移行スクリプト `scripts/migrate-images-to-base64.ts` は、以下のテーブルの画像データを移行します：

- **articles** テーブル：ニュース記事の画像
- **events** テーブル：イベントの画像
- **gifts** テーブル：ギフトの画像
- **user_profiles** テーブル：ユーザープロフィール画像

## 移行スクリプトの機能

### 1. URLからBase64への変換
- 既存の `imageUrl` カラムから画像をダウンロード
- 画像をBase64形式に変換
- ファイル名とMIMEタイプを記録

### 2. 段階的な移行
- 既にBase64データがあるレコードはスキップ
- 移行に失敗したレコードはログに記録
- 移行の進捗状況をリアルタイムで表示

### 3. エラーハンドリング
- ネットワークエラーを適切に処理
- データベース接続エラーをキャッチ
- 移行失敗時の詳細なエラーメッセージ

## 実行方法

### 前提条件

1. **環境変数の設定**
   ```bash
   # .env ファイルに以下を設定
   DATABASE_URL=mysql://user:password@host:port/database
   ```

2. **依存関係のインストール**
   ```bash
   pnpm install
   ```

### スクリプト実行

#### 方法1：tsx を使用（推奨）
```bash
npx tsx scripts/migrate-images-to-base64.ts
```

#### 方法2：Node.js で実行
```bash
# 先にTypeScriptをコンパイル
pnpm tsc scripts/migrate-images-to-base64.ts --outDir dist

# コンパイル後のJavaScriptを実行
node dist/scripts/migrate-images-to-base64.js
```

#### 方法3：package.json にスクリプトを追加
```json
{
  "scripts": {
    "migrate:images": "tsx scripts/migrate-images-to-base64.ts"
  }
}
```

その後、以下で実行：
```bash
pnpm migrate:images
```

## 実行例と出力

```
=== Starting Image Data Migration ===
Timestamp: 2026-02-13T10:30:00.000Z
Starting articles migration...
Found 5 articles with imageUrl
✓ Migrated article 1
✓ Migrated article 2
Article 3 already has imageData, skipping...
✓ Migrated article 4
✓ Migrated article 5
Articles migration complete: 4 migrated, 1 skipped

Starting events migration...
Found 3 events with imageUrl
✓ Migrated event 1
✓ Migrated event 2
✓ Migrated event 3
Events migration complete: 3 migrated, 0 skipped

Starting gifts migration...
Found 2 gifts with imageUrl
✓ Migrated gift 1
✓ Migrated gift 2
Gifts migration complete: 2 migrated, 0 skipped

=== Migration Complete ===
Total migrated: 9 records
Timestamp: 2026-02-13T10:30:15.000Z
```

## トラブルシューティング

### エラー：Database not available
**原因**：DATABASE_URL が設定されていないか、データベースに接続できない

**解決方法**：
```bash
# 環境変数を確認
echo $DATABASE_URL

# .env ファイルが存在するか確認
ls -la .env

# データベース接続をテスト
mysql -h host -u user -p database
```

### エラー：Failed to download image
**原因**：画像URLが無効または到達不可

**解決方法**：
- URLが有効か確認
- ネットワーク接続を確認
- ファイアウォール設定を確認

### 移行が遅い
**原因**：大きな画像ファイルまたは遅いネットワーク接続

**解決方法**：
- ネットワーク速度を確認
- 画像ファイルサイズを確認
- スクリプトを複数回に分けて実行（テーブル別に）

## 移行後の確認

### 1. データベースで確認
```sql
-- Articles テーブルの確認
SELECT id, imageUrl, imageData, imageFileName, imageMimeType 
FROM articles 
WHERE imageData IS NOT NULL 
LIMIT 5;

-- Events テーブルの確認
SELECT id, imageUrl, imageData, imageFileName, imageMimeType 
FROM events 
WHERE imageData IS NOT NULL 
LIMIT 5;

-- Gifts テーブルの確認
SELECT id, imageUrl, imageData, imageFileName, imageMimeType 
FROM gifts 
WHERE imageData IS NOT NULL 
LIMIT 5;
```

### 2. アプリケーションで確認
- ニュース詳細ページで画像が正しく表示されるか確認
- イベント詳細ページで画像が正しく表示されるか確認
- ギフト詳細ページで画像が正しく表示されるか確認

## ロールバック方法

移行に問題が生じた場合は、以下の手順でロールバックできます：

### 1. 移行前のバックアップから復元
```bash
# バックアップから復元
mysql -h host -u user -p database < backup.sql
```

### 2. Base64データをクリア（部分的なロールバック）
```sql
-- Articles テーブルをクリア
UPDATE articles SET imageData = NULL, imageFileName = NULL, imageMimeType = NULL;

-- Events テーブルをクリア
UPDATE events SET imageData = NULL, imageFileName = NULL, imageMimeType = NULL;

-- Gifts テーブルをクリア
UPDATE gifts SET imageData = NULL, imageFileName = NULL, imageMimeType = NULL;
```

## パフォーマンス最適化

### 大量の画像を移行する場合

1. **バッチ処理の実装**
   - スクリプトを複数回に分けて実行
   - 1回の実行で処理するレコード数を制限

2. **並列処理**
   - 複数のテーブルを同時に処理
   - ただし、データベース接続数に注意

3. **スケジューリング**
   - オフピーク時間に実行
   - cron ジョブで定期実行

## 注意事項

1. **ストレージ容量**
   - Base64形式はURL形式より約33%大きくなります
   - ディスク容量を事前に確認してください

2. **バックアップ**
   - 移行前に必ずデータベースをバックアップしてください
   - 移行中のトラブルに備えてください

3. **ネットワーク**
   - 大量の画像ダウンロードはネットワーク負荷が高い
   - オフピーク時間に実行することをお勧めします

4. **既存データ**
   - 移行後も `imageUrl` カラムは保持されます
   - 必要に応じて後で削除できます

## サポート

問題が発生した場合は、以下の情報を収集してサポートに連絡してください：

- エラーメッセージの全文
- スクリプトの実行ログ
- データベースのバージョン
- 移行対象の画像数
- ネットワーク環境の詳細
