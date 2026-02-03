import { getDb } from "../server/db";
import { articles, events, gifts } from "../drizzle/schema";

async function seedData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("Starting data seeding...");

  // ニュース記事のテストデータ
  const sampleArticles = [
    {
      title: "渋谷の新しいカフェがオープン",
      content:
        "渋谷駅から徒歩5分の場所に、地域密着型のカフェがオープンしました。地元の食材を使用したメニューが人気です。",
      category: "store" as const,
      prefecture: "東京都",
      city: "渋谷区",
      imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
    },
    {
      title: "横浜で音楽フェスティバル開催決定",
      content:
        "今年の夏、横浜みなとみらいで大規模な音楽フェスティバルが開催されます。地元アーティストも多数出演予定です。",
      category: "event" as const,
      prefecture: "神奈川県",
      city: "横浜市",
      imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    },
    {
      title: "地域の商店街インタビュー",
      content:
        "創業50年の老舗和菓子店の店主にインタビュー。地域に愛される秘訣を伺いました。",
      category: "interview" as const,
      prefecture: "大阪府",
      city: "大阪市",
      imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    },
    {
      title: "若者が地域活性化に取り組む",
      content:
        "地元の大学生が中心となって、商店街の活性化プロジェクトを始動。SNSを活用した情報発信が好評です。",
      category: "column" as const,
      prefecture: "福岡県",
      city: "福岡市",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    },
    {
      title: "地域の魅力を再発見",
      content:
        "普段見過ごしがちな地域の魅力を再発見するウォーキングツアーが人気を集めています。",
      category: "other" as const,
      prefecture: "京都府",
      city: "京都市",
      imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    },
  ];

  for (const article of sampleArticles) {
    await db.insert(articles).values(article);
    console.log(`✓ Article created: ${article.title}`);
  }

  // イベントのテストデータ
  const sampleEvents = [
    {
      title: "渋谷音楽フェス2026",
      description:
        "地元アーティストが集結する音楽フェスティバル。若者向けの音楽イベントです。",
      eventDate: new Date("2026-06-15T18:00:00"),
      venue: "渋谷公会堂",
      price: "3000.00",
      prefecture: "東京都",
      city: "渋谷区",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
      capacity: 500,
      availableTickets: 500,
    },
    {
      title: "横浜ストリートマーケット",
      description: "地域の手作り雑貨や食品が集まるマーケットイベント。",
      eventDate: new Date("2026-05-20T10:00:00"),
      venue: "横浜赤レンガ倉庫",
      price: "0.00",
      prefecture: "神奈川県",
      city: "横浜市",
      imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800",
      capacity: 1000,
      availableTickets: 1000,
    },
    {
      title: "大阪グルメフェスティバル",
      description: "大阪の名店が集結するグルメイベント。食べ歩きチケット制です。",
      eventDate: new Date("2026-07-10T11:00:00"),
      venue: "大阪城公園",
      price: "2000.00",
      prefecture: "大阪府",
      city: "大阪市",
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      capacity: 800,
      availableTickets: 800,
    },
  ];

  for (const event of sampleEvents) {
    await db.insert(events).values(event);
    console.log(`✓ Event created: ${event.title}`);
  }

  // ギフトのテストデータ
  const sampleGifts = [
    {
      storeName: "カフェ・ド・渋谷",
      giftTitle: "ドリンク1杯無料",
      description: "コーヒーまたは紅茶を1杯無料でご提供します。",
      latitude: 35.6595,
      longitude: 139.7004,
      address: "東京都渋谷区道玄坂1-1-1",
      prefecture: "東京都",
      city: "渋谷区",
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
      expiryDate: new Date("2026-12-31"),
      usageLimit: 1,
      ageRestriction: null,
      schoolTypeRestriction: "none" as const,
    },
    {
      storeName: "横浜ラーメン横丁",
      giftTitle: "トッピング無料",
      description: "お好きなトッピング1品を無料でサービスします。",
      latitude: 35.4437,
      longitude: 139.6380,
      address: "神奈川県横浜市中区山下町1-1",
      prefecture: "神奈川県",
      city: "横浜市",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
      expiryDate: new Date("2026-12-31"),
      usageLimit: 2,
      ageRestriction: null,
      schoolTypeRestriction: "none" as const,
    },
    {
      storeName: "大阪たこ焼き本舗",
      giftTitle: "たこ焼き1舟サービス",
      description: "たこ焼き8個入り1舟を無料でプレゼント。",
      latitude: 34.6937,
      longitude: 135.5023,
      address: "大阪府大阪市中央区道頓堀1-1-1",
      prefecture: "大阪府",
      city: "大阪市",
      imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800",
      expiryDate: new Date("2026-12-31"),
      usageLimit: 1,
      ageRestriction: null,
      schoolTypeRestriction: "high_school" as const,
    },
    {
      storeName: "福岡ブックカフェ",
      giftTitle: "学生限定ドリンク半額",
      description: "学生証提示で全ドリンク半額になります。",
      latitude: 33.5904,
      longitude: 130.4017,
      address: "福岡県福岡市中央区天神1-1-1",
      prefecture: "福岡県",
      city: "福岡市",
      imageUrl: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800",
      expiryDate: new Date("2026-12-31"),
      usageLimit: 3,
      ageRestriction: null,
      schoolTypeRestriction: "university" as const,
    },
  ];

  for (const gift of sampleGifts) {
    await db.insert(gifts).values(gift);
    console.log(`✓ Gift created: ${gift.giftTitle} at ${gift.storeName}`);
  }

  console.log("\n✅ Data seeding completed successfully!");
  process.exit(0);
}

seedData().catch((error) => {
  console.error("❌ Error seeding data:", error);
  process.exit(1);
});
