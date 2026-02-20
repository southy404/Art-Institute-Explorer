import { AICSearchResponseSchema, type Artwork } from "../schemas/artwork";

const BASE = "https://api.artic.edu/api/v1";

// Image URL helper
export function artworkImageUrl(imageId: string, width = 843) {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}

export async function searchArtworks(
  query: string,
  signal?: AbortSignal
): Promise<Artwork[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL(`${BASE}/artworks/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "24");
  url.searchParams.set("fields", "id,title,artist_title,image_id");

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`API error (${res.status})`);
  }

  const json = await res.json();
  const parsed = AICSearchResponseSchema.safeParse(json);
  if (!parsed.success) {
    // reject/handle invalid data
    throw new Error("Invalid API data (Zod validation failed)");
  }
  return parsed.data.data;
}
