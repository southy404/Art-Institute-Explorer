import { z } from "zod";

export const ArtworkSchema = z.object({
  id: z.number(),
  title: z.string().catch("Untitled"),
  artist_title: z.string().nullable().catch(null),
  image_id: z.string().nullable().catch(null),
});

export type Artwork = z.infer<typeof ArtworkSchema>;

export const AICSearchResponseSchema = z.object({
  data: z.array(ArtworkSchema).catch([]),
});
