import { z } from "astro/zod";
import entries from "./log.json";

// Not a content collection: Astro warns on every build while a collection is empty.
const entry = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  kind: z.enum(["win", "flop"]),
  lead: z.string(),
  text: z.string(),
  lesson: z.string().optional(),
});

export const log = z
  .array(entry)
  .parse(entries)
  .toSorted((a, b) => b.month.localeCompare(a.month));
