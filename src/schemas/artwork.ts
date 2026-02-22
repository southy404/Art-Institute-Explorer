import { z } from "zod";

export const ArtworkSchema = z.object({
  id: z.number(),
  title: z.string(),
  artist_title: z.string().nullable().optional(),
  image_id: z.string().nullable().optional(),
  date_display: z.string().nullable().optional(),
  medium_display: z.string().nullable().optional(),
  place_of_origin: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type Artwork = z.infer<typeof ArtworkSchema>;

export const AICSearchResponseSchema = z.object({
  data: z.array(z.unknown()).transform((items) =>
    items
      .map((item) => ArtworkSchema.safeParse(item))
      .filter((r): r is { success: true; data: Artwork } => r.success)
      .map((r) => r.data)
  ),
});
