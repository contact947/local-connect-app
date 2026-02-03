import { z } from "zod";
import { randomBytes } from "crypto";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== ユーザープロフィール ====================
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          age: z.number().int().min(0).max(150).optional(),
          gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
          address: z.string().optional(),
          prefecture: z.string().max(50).optional(),
          city: z.string().max(100).optional(),
          schoolType: z.enum(["high_school", "university", "working", "other"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profileId = await db.createUserProfile({
          userId: ctx.user.id,
          ...input,
        });
        return { profileId };
      }),

    update: protectedProcedure
      .input(
        z.object({
          age: z.number().int().min(0).max(150).optional(),
          gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
          address: z.string().optional(),
          prefecture: z.string().max(50).optional(),
          city: z.string().max(100).optional(),
          schoolType: z.enum(["high_school", "university", "working", "other"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ==================== ニュース記事 ====================
  articles: router({
    list: publicProcedure
      .input(
        z
          .object({
            prefecture: z.string().optional(),
            city: z.string().optional(),
            category: z.enum(["store", "event", "interview", "column", "other"]).optional(),
            limit: z.number().int().min(1).max(100).default(20),
            offset: z.number().int().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getArticles(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const article = await db.getArticleById(input.id);
        if (!article) {
          throw new Error("Article not found");
        }
        await db.incrementArticleViewCount(input.id);
        return article;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          content: z.string().min(1),
          category: z.enum(["store", "event", "interview", "column", "other"]),
          prefecture: z.string().max(50).optional(),
          city: z.string().max(100).optional(),
          imageUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const articleId = await db.createArticle(input);
        return { articleId };
      }),
  }),

  // ==================== イベント ====================
  events: router({
    list: publicProcedure
      .input(
        z
          .object({
            prefecture: z.string().optional(),
            city: z.string().optional(),
            limit: z.number().int().min(1).max(100).default(20),
            offset: z.number().int().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getEvents(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const event = await db.getEventById(input.id);
        if (!event) {
          throw new Error("Event not found");
        }
        return event;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          description: z.string().min(1),
          eventDate: z.string().datetime(),
          venue: z.string().min(1).max(255),
          price: z.string().regex(/^\d+(\.\d{1,2})?$/),
          prefecture: z.string().max(50).optional(),
          city: z.string().max(100).optional(),
          imageUrl: z.string().url().optional(),
          capacity: z.number().int().min(1).optional(),
          availableTickets: z.number().int().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const eventId = await db.createEvent({
          ...input,
          eventDate: new Date(input.eventDate),
        });
        return { eventId };
      }),
  }),

  // ==================== チケット ====================
  tickets: router({
    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTickets(ctx.user.id);
    }),

    purchase: protectedProcedure
      .input(
        z.object({
          eventId: z.number().int(),
          quantity: z.number().int().min(1).max(10),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const event = await db.getEventById(input.eventId);
        if (!event) {
          throw new Error("Event not found");
        }

        if (event.availableTickets !== null && event.availableTickets < input.quantity) {
          throw new Error("Not enough tickets available");
        }

        const totalPrice = (parseFloat(event.price) * input.quantity).toFixed(2);
        const qrCode = `TICKET-${event.id}-${ctx.user.id}-${Date.now()}-${randomBytes(8).toString("hex")}`;

        const ticketId = await db.createTicket({
          userId: ctx.user.id,
          eventId: input.eventId,
          qrCode,
          quantity: input.quantity,
          totalPrice,
          isUsed: false,
        });

        if (event.availableTickets !== null) {
          await db.updateEventTickets(input.eventId, input.quantity);
        }

        return { ticketId, qrCode };
      }),

    verify: protectedProcedure
      .input(z.object({ qrCode: z.string() }))
      .query(async ({ input }) => {
        const ticket = await db.getTicketByQrCode(input.qrCode);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        return ticket;
      }),

    use: protectedProcedure
      .input(z.object({ qrCode: z.string() }))
      .mutation(async ({ input }) => {
        const ticket = await db.getTicketByQrCode(input.qrCode);
        if (!ticket) {
          throw new Error("Ticket not found");
        }
        if (ticket.isUsed) {
          throw new Error("Ticket already used");
        }

        await db.markTicketAsUsed(input.qrCode);
        return { success: true };
      }),
  }),

  // ==================== ギフト ====================
  gifts: router({
    list: publicProcedure
      .input(
        z
          .object({
            prefecture: z.string().optional(),
            city: z.string().optional(),
            limit: z.number().int().min(1).max(100).default(20),
            offset: z.number().int().min(0).default(0),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getGifts(input);
      }),

    nearby: publicProcedure
      .input(
        z.object({
          latitude: z.number(),
          longitude: z.number(),
          limit: z.number().int().min(1).max(100).default(20),
        })
      )
      .query(async ({ input }) => {
        const allGifts = await db.getGifts();
        const giftsWithDistance = allGifts.map((gift) => ({
          ...gift,
          distance: db.calculateDistance(
            input.latitude,
            input.longitude,
            gift.latitude,
            gift.longitude
          ),
        }));
        giftsWithDistance.sort((a, b) => a.distance - b.distance);
        return giftsWithDistance.slice(0, input.limit);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const gift = await db.getGiftById(input.id);
        if (!gift) {
          throw new Error("Gift not found");
        }
        return gift;
      }),

    checkUsage: protectedProcedure
      .input(z.object({ giftId: z.number().int() }))
      .query(async ({ ctx, input }) => {
        const usageCount = await db.getGiftUsageCount(ctx.user.id, input.giftId);
        const gift = await db.getGiftById(input.giftId);
        if (!gift) {
          throw new Error("Gift not found");
        }
        return {
          usageCount,
          usageLimit: gift.usageLimit,
          canUse: usageCount < gift.usageLimit,
        };
      }),

    use: protectedProcedure
      .input(z.object({ giftId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        const gift = await db.getGiftById(input.giftId);
        if (!gift) {
          throw new Error("Gift not found");
        }

        const usageCount = await db.getGiftUsageCount(ctx.user.id, input.giftId);
        if (usageCount >= gift.usageLimit) {
          throw new Error("Gift usage limit exceeded");
        }

        const profile = await db.getUserProfile(ctx.user.id);
        if (profile) {
          if (gift.ageRestriction && profile.age && profile.age < gift.ageRestriction) {
            throw new Error("Age restriction not met");
          }
          if (
            gift.schoolTypeRestriction &&
            gift.schoolTypeRestriction !== "none" &&
            profile.schoolType !== gift.schoolTypeRestriction
          ) {
            throw new Error("School type restriction not met");
          }
        }

        const qrCode = `GIFT-${gift.id}-${ctx.user.id}-${Date.now()}-${randomBytes(8).toString("hex")}`;
        const usageId = await db.createGiftUsage({
          userId: ctx.user.id,
          giftId: input.giftId,
          qrCode,
        });

        return { usageId, qrCode };
      }),

    verify: protectedProcedure
      .input(z.object({ qrCode: z.string() }))
      .query(async ({ input }) => {
        const usage = await db.getGiftUsageByQrCode(input.qrCode);
        if (!usage) {
          throw new Error("Gift usage not found");
        }
        return usage;
      }),

    create: protectedProcedure
      .input(
        z.object({
          storeName: z.string().min(1).max(255),
          giftTitle: z.string().min(1).max(255),
          description: z.string().min(1),
          latitude: z.number(),
          longitude: z.number(),
          address: z.string().optional(),
          prefecture: z.string().max(50).optional(),
          city: z.string().max(100).optional(),
          imageUrl: z.string().url().optional(),
          expiryDate: z.string().datetime().optional(),
          usageLimit: z.number().int().min(1).default(1),
          ageRestriction: z.number().int().min(0).max(150).optional(),
          schoolTypeRestriction: z
            .enum(["high_school", "university", "working", "none"])
            .default("none"),
        })
      )
      .mutation(async ({ input }) => {
        const giftId = await db.createGift({
          ...input,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        });
        return { giftId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
