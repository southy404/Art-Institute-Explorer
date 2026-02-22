import { AICSearchResponseSchema, type Artwork } from "../schemas/artwork";

const BASE = "https://api.artic.edu/api/v1";

export function artworkImageUrl(imageId: string, width = 843) {
  return `https://www.artic.edu/iiif/2/${imageId}/full/${width},/0/default.jpg`;
}

export async function fetchArtworkDetail(id: number) {
  const res = await fetch(
    `${BASE}/artworks/${id}?fields=id,title,artist_title,image_id,thumbnail,description,date_display,medium_display,place_of_origin`
  );
  if (!res.ok) throw new Error("Failed to load artwork details");
  const json = await res.json();
  return json.data;
}

export async function searchArtworks(
  query: string,
  signal?: AbortSignal,
  limit = 24,
  page = 1
): Promise<{ artworks: Artwork[]; hasMore: boolean }> {
  const q = query.trim();
  if (!q) return { artworks: [], hasMore: false };

  const url = new URL(`${BASE}/artworks/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set(
    "fields",
    "id,title,artist_title,image_id,date_display,medium_display,place_of_origin,description"
  );

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) throw new Error(`API error (${res.status})`);

  const json = await res.json();
  const parsed = AICSearchResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error("Invalid API data");

  const artworks = parsed.data.data;
  const total = json.pagination?.total ?? 0;
  const hasMore = page * limit < total;

  return { artworks, hasMore };
}
