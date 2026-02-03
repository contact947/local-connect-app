import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  articles,
  events,
  tickets,
  gifts,
  giftUsages,
  type InsertUserProfile,
  type InsertArticle,
  type InsertEvent,
  type InsertTicket,
  type InsertGift,
  type InsertGiftUsage,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== ユーザープロフィール ====================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createUserProfile(data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userProfiles).values(data);
  return Number(result[0].insertId);
}

export async function updateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
}

// ==================== ニュース記事 ====================

export async function getArticles(filters?: {
  prefecture?: string;
  city?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(articles);

  const conditions = [];
  if (filters?.prefecture) {
    conditions.push(eq(articles.prefecture, filters.prefecture));
  }
  if (filters?.city) {
    conditions.push(eq(articles.city, filters.city));
  }
  if (filters?.category) {
    conditions.push(eq(articles.category, filters.category as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(articles.publishedAt)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0] || null;
}

export async function incrementArticleViewCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, id));
}

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(articles).values(data);
  return Number(result[0].insertId);
}

// ==================== イベント ====================

export async function getEvents(filters?: {
  prefecture?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(events);

  const conditions = [];
  if (filters?.prefecture) {
    conditions.push(eq(events.prefecture, filters.prefecture));
  }
  if (filters?.city) {
    conditions.push(eq(events.city, filters.city));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(events.eventDate) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result[0] || null;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(events).values(data);
  return Number(result[0].insertId);
}

export async function updateEventTickets(eventId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(events)
    .set({ availableTickets: sql`${events.availableTickets} - ${quantity}` })
    .where(eq(events.id, eventId));
}

// ==================== チケット ====================

export async function getUserTickets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      ticket: tickets,
      event: events,
    })
    .from(tickets)
    .leftJoin(events, eq(tickets.eventId, events.id))
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.purchasedAt));
}

export async function getTicketByQrCode(qrCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tickets).where(eq(tickets.qrCode, qrCode)).limit(1);
  return result[0] || null;
}

export async function createTicket(data: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tickets).values(data);
  return Number(result[0].insertId);
}

export async function markTicketAsUsed(qrCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tickets)
    .set({ isUsed: true, usedAt: new Date() })
    .where(eq(tickets.qrCode, qrCode));
}

// ==================== ギフト ====================

export async function getGifts(filters?: {
  prefecture?: string;
  city?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(gifts);

  const conditions = [eq(gifts.isActive, true)];
  if (filters?.prefecture) {
    conditions.push(eq(gifts.prefecture, filters.prefecture));
  }
  if (filters?.city) {
    conditions.push(eq(gifts.city, filters.city));
  }

  query = query.where(and(...conditions)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function getGiftById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(gifts).where(eq(gifts.id, id)).limit(1);
  return result[0] || null;
}

export async function createGift(data: InsertGift) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(gifts).values(data);
  return Number(result[0].insertId);
}

// ==================== ギフト使用履歴 ====================

export async function getGiftUsageCount(userId: number, giftId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(giftUsages)
    .where(and(eq(giftUsages.userId, userId), eq(giftUsages.giftId, giftId)));

  return Number(result[0]?.count || 0);
}

export async function createGiftUsage(data: InsertGiftUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(giftUsages).values(data);
  return Number(result[0].insertId);
}

export async function getGiftUsageByQrCode(qrCode: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(giftUsages).where(eq(giftUsages.qrCode, qrCode)).limit(1);
  return result[0] || null;
}

// ==================== 距離計算ヘルパー ====================

/**
 * Haversine公式を使用し2点間の距離を計算（km単位）
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球の半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
