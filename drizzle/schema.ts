import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, double } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ユーザープロフィールテーブル
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female", "other", "prefer_not_to_say"]),
  address: text("address"), // 地域判定に使用（例: "東京都渋谷区"）
  prefecture: varchar("prefecture", { length: 50 }), // 都道府県
  city: varchar("city", { length: 100 }), // 市区町村
  schoolType: mysqlEnum("schoolType", ["high_school", "university", "working", "other"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ニュース記事テーブル
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["store", "event", "interview", "column", "other"]).default("other").notNull(),
  prefecture: varchar("prefecture", { length: 50 }), // 都道府県
  city: varchar("city", { length: 100 }), // 市区町村
  imageUrl: text("imageUrl"),
  viewCount: int("viewCount").default(0).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// イベントテーブル
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("eventDate").notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00").notNull(),
  prefecture: varchar("prefecture", { length: 50 }), // 都道府県
  city: varchar("city", { length: 100 }), // 市区町村
  imageUrl: text("imageUrl"),
  capacity: int("capacity"), // 定員
  availableTickets: int("availableTickets"), // 残りチケット数
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// チケットテーブル
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  qrCode: varchar("qrCode", { length: 255 }).notNull().unique(), // QRコード文字列
  quantity: int("quantity").default(1).notNull(), // 購入枚数
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  isUsed: boolean("isUsed").default(false).notNull(), // 使用済みフラグ
  usedAt: timestamp("usedAt"), // 使用日時
  purchasedAt: timestamp("purchasedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ギフトテーブル
export const gifts = mysqlTable("gifts", {
  id: int("id").autoincrement().primaryKey(),
  storeName: varchar("storeName", { length: 255 }).notNull(),
  giftTitle: varchar("giftTitle", { length: 255 }).notNull(),
  description: text("description").notNull(),
  latitude: double("latitude").notNull(), // 緯度
  longitude: double("longitude").notNull(), // 経度
  address: text("address"), // 店舗住所
  prefecture: varchar("prefecture", { length: 50 }),
  city: varchar("city", { length: 100 }),
  imageUrl: text("imageUrl"),
  expiryDate: timestamp("expiryDate"), // 有効期限
  usageLimit: int("usageLimit").default(1).notNull(), // 1人あたりの使用回数制限
  ageRestriction: int("ageRestriction"), // 年齢制限（例: 18歳以上）
  schoolTypeRestriction: mysqlEnum("schoolTypeRestriction", ["high_school", "university", "working", "none"]).default("none"),
  isActive: boolean("isActive").default(true).notNull(), // 有効/無効
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ギフト使用履歴テーブル
export const giftUsages = mysqlTable("gift_usages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  giftId: int("giftId").notNull(),
  qrCode: varchar("qrCode", { length: 255 }).notNull().unique(), // QRコード文字列
  usedAt: timestamp("usedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 型エクスポート
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

export type Gift = typeof gifts.$inferSelect;
export type InsertGift = typeof gifts.$inferInsert;

export type GiftUsage = typeof giftUsages.$inferSelect;
export type InsertGiftUsage = typeof giftUsages.$inferInsert;
