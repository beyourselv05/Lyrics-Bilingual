import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export type LyricLine = {
  line: string;
  translation: string;
};

export const songs = pgTable("songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  geniusId: text("genius_id").notNull().unique(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  lyrics: jsonb("lyrics").$type<LyricLine[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastViewedAt: timestamp("last_viewed_at").defaultNow().notNull(),
});
