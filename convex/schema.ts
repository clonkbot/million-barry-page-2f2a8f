import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  pixels: defineTable({
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    imageUrl: v.string(),
    linkUrl: v.optional(v.string()),
    title: v.string(),
    userId: v.id("users"),
    purchasedAt: v.number(),
    priceInCents: v.number(),
  }).index("by_position", ["x", "y"]),

  gridCells: defineTable({
    cellIndex: v.number(),
    ownerId: v.optional(v.id("users")),
    pixelId: v.optional(v.id("pixels")),
  }).index("by_cell", ["cellIndex"]),
});
