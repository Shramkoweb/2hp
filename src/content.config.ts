import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: file("src/data/projects.json"),
  schema: ({ image }) =>
    z.object({
      order: z.int().positive(),
      name: z.string(),
      logo: image(),
      stores: z.array(z.enum(["Chrome", "Edge", "Firefox"])).nonempty(),
      since: z.coerce.date(),
      what: z.string(),
      users: z.int().nonnegative(),
      rating: z.number().min(1).max(5),
      ratings: z.int().positive(),
      installs: z.object({
        store: z.enum(["Chrome", "Edge", "Firefox"]),
        from: z.coerce.date(),
        weekly: z.array(z.int().nonnegative()).nonempty(),
      }),
    }),
});

const upcoming = defineCollection({
  loader: file("src/data/upcoming.json"),
  schema: ({ image }) =>
    z.object({
      order: z.int().positive(),
      name: z.string(),
      logo: image(),
      note: z.string(),
    }),
});

const posts = defineCollection({
  loader: file("src/data/posts.json"),
  schema: z.object({
    order: z.int().positive(),
    title: z.string(),
    draft: z.boolean(),
  }),
});

export const collections = { projects, upcoming, posts };
