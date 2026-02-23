import { useEffect, useRef, useState } from "react";
import type { Artwork } from "../schemas/artwork";
import { fetchAllArtworks, artworkImageUrl } from "../api/aic";

type Props = {
  onOpen: (a: Artwork) => void;
  saved: Set<number>;
  onAdd: (a: Artwork) => void;
};

const COL_COUNTS = { sm: 2, md: 3, lg: 4, xl: 5 };

function useColCount() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1536) setCols(COL_COUNTS.xl);
      else if (w >= 1024) setCols(COL_COUNTS.lg);
      else if (w >= 640) setCols(COL_COUNTS.md);
      else setCols(COL_COUNTS.sm);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

export default function BrowseAll({ onOpen, saved, onAdd }: Props) {
  const [items, setItems] = useState<Artwork[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const cols = useColCount();

  async function loadNext() {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setErr("");

    try {
      const { artworks, hasMore: more } = await fetchAllArtworks(
        pageRef.current,
        24
      );
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...artworks.filter((a) => !seen.has(a.id))];
      });
      setHasMore(more);
      pageRef.current += 1;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNext();
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNext();
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [hasMore, loading]);

  const columns: Artwork[][] = Array.from({ length: cols }, () => []);
  items.filter(Boolean).forEach((item, i) => {
    columns[i % cols].push(item);
  });

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-black/50">BROWSE</p>
          <h2 className="text-2xl font-semibold">
            All Artworks{" "}
            {items.length > 0 && (
              <span className="font-normal text-black/40">
                ({items.length})
              </span>
            )}
          </h2>
        </div>
        <p className="text-sm text-black/40">
          {loading
            ? "Loading…"
            : hasMore
            ? "Scroll for more"
            : "End of collection"}
        </p>
      </div>

      {err && (
        <div className="border border-black/15 bg-white p-4 text-sm">{err}</div>
      )}

      {/* Stable Masonry Grid */}
      <div className="flex gap-3 sm:gap-4 items-start">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-1 flex-col gap-3 sm:gap-4 min-h-0">
            {col.map((a) => (
              <figure key={a.id} className="">
                <button
                  type="button"
                  onClick={() => onOpen(a)}
                  className="group relative block w-full overflow-hidden border border-black/10 text-left transition hover:border-black/30"
                >
                  {a.image_id ? (
                    <img
                      src={artworkImageUrl(a.image_id, 843)}
                      alt={a.title}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-auto object-contain"
                      style={{ minHeight: "120px" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="flex min-h-[140px] items-center justify-center p-6 text-xs text-black/40">
                      No image
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-white">
                        {a.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
                        {a.artist_title ?? "Unknown artist"}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Action row */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-black/40">ID {a.id}</span>
                  <button
                    type="button"
                    onClick={() => onAdd(a)}
                    disabled={saved.has(a.id)}
                    className="border border-black/15 bg-white px-3 py-1 text-[10px] transition hover:border-black disabled:opacity-40"
                  >
                    {saved.has(a.id) ? "Saved" : "Add"}
                  </button>
                </div>
              </figure>
            ))}
          </div>
        ))}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <p className="pb-6 text-center text-sm text-black/40">Loading…</p>
      )}
    </section>
  );
}
