import { getDb } from '../server/db';
import { articles, events, gifts, userProfiles } from '../drizzle/schema';
import { eq, isNotNull } from 'drizzle-orm';

/**
 * URLから画像をダウンロードしてBase64に変換
 */
async function downloadImageAsBase64(imageUrl: string): Promise<{
  base64: string;
  mimeType: string;
  fileName: string;
} | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${imageUrl} (${response.status})`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const fileName = imageUrl.split('/').pop() || 'image.jpg';

    return {
      base64,
      mimeType: contentType,
      fileName,
    };
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error);
    return null;
  }
}

/**
 * articlesテーブルの画像を移行
 */
async function migrateArticles() {
  console.log('Starting articles migration...');
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      return 0;
    }

    const articlesToMigrate = await db
      .select()
      .from(articles)
      .where(isNotNull(articles.imageUrl));

    console.log(`Found ${articlesToMigrate.length} articles with imageUrl`);

    let successCount = 0;
    let skipCount = 0;

    for (const article of articlesToMigrate) {
      if (!article.imageUrl) {
        skipCount++;
        continue;
      }

      // 既にBase64データがある場合はスキップ
      if (article.imageData) {
        console.log(`Article ${article.id} already has imageData, skipping...`);
        skipCount++;
        continue;
      }

      const imageData = await downloadImageAsBase64(article.imageUrl);
      if (!imageData) {
        console.warn(`Failed to migrate article ${article.id}`);
        continue;
      }

      await db
        .update(articles)
        .set({
          imageData: imageData.base64,
          imageFileName: imageData.fileName,
          imageMimeType: imageData.mimeType,
        })
        .where(eq(articles.id, article.id));

      successCount++;
      console.log(`✓ Migrated article ${article.id}`);
    }

    console.log(`Articles migration complete: ${successCount} migrated, ${skipCount} skipped`);
    return successCount;
  } catch (error) {
    console.error('Error migrating articles:', error);
    throw error;
  }
}

/**
 * eventsテーブルの画像を移行
 */
async function migrateEvents() {
  console.log('Starting events migration...');
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      return 0;
    }

    const eventsToMigrate = await db
      .select()
      .from(events)
      .where(isNotNull(events.imageUrl));

    console.log(`Found ${eventsToMigrate.length} events with imageUrl`);

    let successCount = 0;
    let skipCount = 0;

    for (const event of eventsToMigrate) {
      if (!event.imageUrl) {
        skipCount++;
        continue;
      }

      // 既にBase64データがある場合はスキップ
      if (event.imageData) {
        console.log(`Event ${event.id} already has imageData, skipping...`);
        skipCount++;
        continue;
      }

      const imageData = await downloadImageAsBase64(event.imageUrl);
      if (!imageData) {
        console.warn(`Failed to migrate event ${event.id}`);
        continue;
      }

      await db
        .update(events)
        .set({
          imageData: imageData.base64,
          imageFileName: imageData.fileName,
          imageMimeType: imageData.mimeType,
        })
        .where(eq(events.id, event.id));

      successCount++;
      console.log(`✓ Migrated event ${event.id}`);
    }

    console.log(`Events migration complete: ${successCount} migrated, ${skipCount} skipped`);
    return successCount;
  } catch (error) {
    console.error('Error migrating events:', error);
    throw error;
  }
}

/**
 * giftsテーブルの画像を移行
 */
async function migrateGifts() {
  console.log('Starting gifts migration...');
  try {
    const db = await getDb();
    if (!db) {
      console.error('Database not available');
      return 0;
    }

    const giftsToMigrate = await db
      .select()
      .from(gifts)
      .where(isNotNull(gifts.imageUrl));

    console.log(`Found ${giftsToMigrate.length} gifts with imageUrl`);

    let successCount = 0;
    let skipCount = 0;

    for (const gift of giftsToMigrate) {
      if (!gift.imageUrl) {
        skipCount++;
        continue;
      }

      // 既にBase64データがある場合はスキップ
      if (gift.imageData) {
        console.log(`Gift ${gift.id} already has imageData, skipping...`);
        skipCount++;
        continue;
      }

      const imageData = await downloadImageAsBase64(gift.imageUrl);
      if (!imageData) {
        console.warn(`Failed to migrate gift ${gift.id}`);
        continue;
      }

      await db
        .update(gifts)
        .set({
          imageData: imageData.base64,
          imageFileName: imageData.fileName,
          imageMimeType: imageData.mimeType,
        })
        .where(eq(gifts.id, gift.id));

      successCount++;
      console.log(`✓ Migrated gift ${gift.id}`);
    }

    console.log(`Gifts migration complete: ${successCount} migrated, ${skipCount} skipped`);
    return successCount;
  } catch (error) {
    console.error('Error migrating gifts:', error);
    throw error;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('=== Starting Image Data Migration ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);

  try {
    const articleCount = await migrateArticles();
    const eventCount = await migrateEvents();
    const giftCount = await migrateGifts();

    const totalMigrated = articleCount + eventCount + giftCount;
    console.log(`\n=== Migration Complete ===`);
    console.log(`Total migrated: ${totalMigrated} records`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// スクリプト実行
main();
