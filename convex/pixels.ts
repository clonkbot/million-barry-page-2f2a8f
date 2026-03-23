import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Barry Chuckle image URLs - various photos of the legend
const BARRY_IMAGES = [
  "https://ichef.bbci.co.uk/news/976/cpsprodpb/462C/production/_102857011_hi048241927.jpg",
  "https://ichef.bbci.co.uk/news/976/cpsprodpb/14DEB/production/_102856847_hi003406875.jpg",
  "https://i2-prod.mirror.co.uk/incoming/article13043082.ece/ALTERNATES/s1200c/0_Chuckle-Brothers.jpg",
  "https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/08/05/17/barry-chuckle.jpg",
  "https://i2-prod.chroniclelive.co.uk/incoming/article15002619.ece/ALTERNATES/s1200c/0_Barry-Chuckle.jpg",
];

export const getAllPixels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pixels").collect();
  },
});

export const getOccupiedCells = query({
  args: {},
  handler: async (ctx) => {
    const cells = await ctx.db
      .query("gridCells")
      .filter((q) => q.neq(q.field("ownerId"), undefined))
      .collect();
    return cells;
  },
});

export const purchasePixels = mutation({
  args: {
    startX: v.number(),
    startY: v.number(),
    width: v.number(),
    height: v.number(),
    title: v.string(),
    linkUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate bounds (100x100 grid, each cell is 10x10 pixels = 1000x1000 total)
    if (args.startX < 0 || args.startY < 0 ||
        args.startX + args.width > 100 ||
        args.startY + args.height > 100) {
      throw new Error("Selection out of bounds");
    }

    if (args.width < 1 || args.height < 1 || args.width > 10 || args.height > 10) {
      throw new Error("Invalid size (min 1x1, max 10x10)");
    }

    // Check if any cells are already taken
    for (let x = args.startX; x < args.startX + args.width; x++) {
      for (let y = args.startY; y < args.startY + args.height; y++) {
        const cellIndex = y * 100 + x;
        const existing = await ctx.db
          .query("gridCells")
          .withIndex("by_cell", (q) => q.eq("cellIndex", cellIndex))
          .first();
        if (existing && existing.ownerId) {
          throw new Error(`Cell at ${x},${y} is already owned`);
        }
      }
    }

    // Calculate price ($1 per pixel, 10x10 pixels per cell)
    const numCells = args.width * args.height;
    const priceInCents = numCells * 100;

    // Pick a random Barry image
    const imageUrl = BARRY_IMAGES[Math.floor(Math.random() * BARRY_IMAGES.length)];

    // Create the pixel block
    const pixelId = await ctx.db.insert("pixels", {
      x: args.startX,
      y: args.startY,
      width: args.width,
      height: args.height,
      imageUrl,
      linkUrl: args.linkUrl,
      title: args.title,
      userId,
      purchasedAt: Date.now(),
      priceInCents,
    });

    // Mark cells as owned
    for (let x = args.startX; x < args.startX + args.width; x++) {
      for (let y = args.startY; y < args.startY + args.height; y++) {
        const cellIndex = y * 100 + x;
        const existing = await ctx.db
          .query("gridCells")
          .withIndex("by_cell", (q) => q.eq("cellIndex", cellIndex))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, { ownerId: userId, pixelId });
        } else {
          await ctx.db.insert("gridCells", {
            cellIndex,
            ownerId: userId,
            pixelId,
          });
        }
      }
    }

    return pixelId;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const pixels = await ctx.db.query("pixels").collect();
    const totalSold = pixels.reduce((acc, p) => acc + (p.width * p.height), 0);
    const totalRevenue = pixels.reduce((acc, p) => acc + p.priceInCents, 0);
    return {
      totalSold,
      totalRevenue: totalRevenue / 100,
      totalAvailable: 10000 - totalSold,
      numPurchases: pixels.length,
    };
  },
});

export const getMyPixels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pixels")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
  },
});
