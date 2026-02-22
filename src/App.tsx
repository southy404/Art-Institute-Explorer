import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import ArtworkCard from "./components/ArtworkCard";
import Gallery from "./components/Gallery";
import ArtworkModal from "./components/ArtworkModal";
import HeroArtwork from "./components/HeroArtwork";
import CategoryTiles from "./components/CategoryTiles";
import Logo from "./assets/logo.svg";
import { searchArtworks, fetchArtworkDetail } from "./api/aic";
import type { Artwork } from "./schemas/artwork";
import { loadGallery, loadNotes, saveGallery, saveNotes } from "./lib/storage";
import { NoteSchema } from "./types";
import ArtworkRow from "./components/ArtworkRow";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { ArtworkSchema } from "./schemas/artwork";

type Tab = "search" | "gallery";

/* ---------- SENTINELS ---------- */

function SearchSentinel({
  onLoadMore,
  hasMore,
  isLoading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  const { sentinelRef } = useInfiniteScroll(onLoadMore, hasMore, isLoading);
  return <div ref={sentinelRef} className="h-1" />;
}

function BrowseSentinel({
  onLoadMore,
  hasMore,
  isLoading,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  const { sentinelRef } = useInfiniteScroll(onLoadMore, hasMore, isLoading);
  return <div ref={sentinelRef} className="h-1" />;
}

/* ---------- APP ---------- */

export default function App() {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [daily, setDaily] = useState<Artwork[]>([]);
  const [monet, setMonet] = useState<Artwork[]>([]);
  const [abstract, setAbstract] = useState<Artwork[]>([]);
  const [portrait, setPortrait] = useState<Artwork[]>([]);

  const [results, setResults] = useState<Artwork[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const homeAbortRef = useRef<AbortController | null>(null);

  /* ---------- CATEGORY TILE IMAGES ---------- */

  const [categoryTiles, setCategoryTiles] = useState<
    { label: string; query: string; artwork?: Artwork }[]
  >([]);

  useEffect(() => {
    async function loadTiles() {
      const defs = [
        { label: "Impressionism", query: "impressionism" },
        { label: "Abstract", query: "abstract" },
        { label: "Portraits", query: "portrait" },
        { label: "Modern Art", query: "modern art" },
        { label: "Sculpture", query: "sculpture" },
        { label: "Photography", query: "photography" },
      ];

      const withImages = await Promise.all(
        defs.map(async (d) => {
          const res = await searchArtworks(d.query, undefined, 1);
          return { ...d, artwork: res.artworks[0] };
        })
      );

      setCategoryTiles(withImages);
    }

    loadTiles();
  }, []);

  /* ---------- STORAGE ---------- */

  useEffect(() => {
    setGallery(loadGallery());
    setNotes(loadNotes());
  }, []);

  useEffect(() => saveGallery(gallery), [gallery]);
  useEffect(() => saveNotes(notes), [notes]);

  const savedIds = useMemo(() => new Set(gallery.map((g) => g.id)), [gallery]);

  /* ---------- MODAL BODY LOCK ---------- */

  useEffect(() => {
    if (!activeArtwork) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeArtwork]);

  /* ---------- HOME ROWS ---------- */

  useEffect(() => {
    if (tab !== "search" || query) return;

    homeAbortRef.current?.abort();
    const controller = new AbortController();
    homeAbortRef.current = controller;

    Promise.all([
      searchArtworks("painting", controller.signal),
      searchArtworks("Monet", controller.signal),
      searchArtworks("abstract", controller.signal),
      searchArtworks("portrait", controller.signal),
    ])
      .then(([d, m, a, p]) => {
        setDaily(d.artworks);
        setMonet(m.artworks);
        setAbstract(a.artworks);
        setPortrait(p.artworks);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [query, tab]);
  const heroArtwork = useMemo(() => {
    const pool = [...daily, ...monet, ...abstract, ...portrait];
    if (!pool.length) return undefined;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [daily, monet, abstract, portrait]);
  /* ---------- SEARCH ---------- */

  async function runSearch(q: string) {
    const trimmed = q.trim();
    setQuery(trimmed);
    setError("");
    setResults([]);
    setSearchPage(1);
    setSearchHasMore(false);

    abortRef.current?.abort();
    if (!trimmed) return;

    // ID-Suche: wenn nur Zahlen eingegeben wurden
    if (/^\d+$/.test(trimmed)) {
      setIsLoading(true);
      try {
        const detail = await fetchArtworkDetail(Number(trimmed));
        if (detail) {
          const parsed = ArtworkSchema.safeParse(detail);
          if (parsed.success) {
            setResults([parsed.data]);
            setSearchHasMore(false);
          } else {
            setError("Artwork not found");
          }
        }
      } catch {
        setError("Artwork not found");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // normaler Text-Search
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);

    try {
      const { artworks, hasMore } = await searchArtworks(
        trimmed,
        controller.signal,
        24,
        1
      );
      setResults(artworks);
      setSearchHasMore(hasMore);
      setSearchPage(2);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMoreSearch() {
    if (!query || isLoading || !searchHasMore) return;
    setIsLoading(true);
    try {
      const { artworks, hasMore } = await searchArtworks(
        query,
        undefined,
        24,
        searchPage
      );
      setResults((prev) => [...prev, ...artworks]);
      setSearchHasMore(hasMore);
      setSearchPage((p) => p + 1);
    } finally {
      setIsLoading(false);
    }
  }

  /* ---------- SEE ALL ---------- */

  const [browseQuery, setBrowseQuery] = useState<string | null>(null);
  const [browseResults, setBrowseResults] = useState<Artwork[]>([]);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseHasMore, setBrowseHasMore] = useState(false);
  const [browseLoading, setBrowseLoading] = useState(false);

  async function openBrowse(q: string) {
    setBrowseQuery(q);
    setBrowseResults([]);
    setBrowsePage(1);
    setBrowseHasMore(false);
    setBrowseLoading(true);
    try {
      const { artworks, hasMore } = await searchArtworks(q, undefined, 24, 1);
      setBrowseResults(artworks);
      setBrowseHasMore(hasMore);
      setBrowsePage(2);
    } finally {
      setBrowseLoading(false);
    }
  }

  async function loadMoreBrowse() {
    if (!browseQuery || browseLoading || !browseHasMore) return;
    setBrowseLoading(true);
    try {
      const { artworks, hasMore } = await searchArtworks(
        browseQuery,
        undefined,
        24,
        browsePage
      );
      setBrowseResults((prev) => [...prev, ...artworks]);
      setBrowseHasMore(hasMore);
      setBrowsePage((p) => p + 1);
    } finally {
      setBrowseLoading(false);
    }
  }

  /* ---------- GALLERY ---------- */

  function addToGallery(artwork: Artwork) {
    setGallery((prev) =>
      prev.some((x) => x.id === artwork.id) ? prev : [artwork, ...prev]
    );
  }

  function removeFromGallery(id: number) {
    setGallery((prev) => prev.filter((x) => x.id !== id));
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[String(id)];
      return copy;
    });
  }

  function updateNote(id: number, value: string) {
    const safe = NoteSchema.parse(value);
    setNotes((prev) => ({ ...prev, [String(id)]: safe }));
  }

  const showHome = tab === "search" && !query;
  const showSearchResults = tab === "search" && Boolean(query);

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[var(--paper)]/90 backdrop-blur">
        <div className="px-4 py-4 sm:px-8 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setTab("search");
              setQuery("");
              setResults([]);
              setError("");
              setBrowseQuery(null);
            }}
          >
            <img src={Logo} alt="Logo" className="h-15 w-auto" />

            <div className="hidden sm:block">
              <p className="text-[10px] tracking-[0.28em] text-black/60">
                ART INSTITUTE EXPLORER
              </p>
              <h1 className="text-sm font-semibold">Collection Browser</h1>
            </div>
          </div>
          <nav className="flex gap-2">
            <SearchBar onSearch={runSearch} isLoading={isLoading} />

            <button
              onClick={() => setTab("gallery")}
              className={`border px-4 py-2 text-sm ${
                tab === "gallery"
                  ? "border-black bg-black text-white"
                  : "border-black/15 bg-white hover:border-black"
              }`}
            >
              Gallery ({gallery.length})
            </button>
          </nav>
        </div>
      </header>
      <section className="border-b border-black/10 px-4 py-14 sm:px-8">
        <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          A quiet place to collect art.
        </h2>

        <p className="mt-4 max-w-xl text-base text-black/60">
          Browse curated rows, explore categories, and save artworks into your
          personal collection.
        </p>
      </section>
      <main className="px-4 py-8 sm:px-8">
        {showHome && !browseQuery && (
          <HeroArtwork artwork={heroArtwork} onOpen={setActiveArtwork} />
        )}

        {tab === "search" ? (
          <section className="space-y-8">
            {error && (
              <div className="border border-black/15 bg-white p-4 text-sm">
                {error}
              </div>
            )}

            {/* BROWSE VIEW */}
            {showHome && browseQuery && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.28em] text-black/50">
                      BROWSING
                    </p>
                    <h2 className="text-2xl font-semibold capitalize">
                      {browseQuery}
                    </h2>
                  </div>
                  <button
                    onClick={() => setBrowseQuery(null)}
                    className="text-xs tracking-[0.18em] text-black/50 hover:text-black transition-colors"
                  >
                    ← BACK
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {browseResults.map((a) => (
                    <ArtworkCard
                      key={a.id}
                      artwork={a}
                      variant="search"
                      isSaved={savedIds.has(a.id)}
                      onAdd={() => addToGallery(a)}
                      onOpen={() => setActiveArtwork(a)}
                    />
                  ))}
                </div>

                {/* Sentinel */}
                <BrowseSentinel
                  onLoadMore={loadMoreBrowse}
                  hasMore={browseHasMore}
                  isLoading={browseLoading}
                />
                {browseLoading && (
                  <p className="text-center text-sm text-black/40 py-4">
                    Loading…
                  </p>
                )}
              </div>
            )}

            {/* HOME VIEW */}
            {showHome && !browseQuery && (
              <section className="space-y-12">
                <CategoryTiles tiles={categoryTiles} onSelect={runSearch} />

                <ArtworkRow
                  title="Artworks of the Day"
                  query="painting"
                  items={daily}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                  onSeeAll={openBrowse}
                />
                <ArtworkRow
                  title="Monet Spotlight"
                  query="Monet"
                  items={monet}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                  onSeeAll={openBrowse}
                />
                <ArtworkRow
                  title="Abstract Highlights"
                  query="abstract"
                  items={abstract}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                  onSeeAll={openBrowse}
                />
                <ArtworkRow
                  title="Portrait Study"
                  query="portrait"
                  items={portrait}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                  onSeeAll={openBrowse}
                />
              </section>
            )}
            {showSearchResults && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {results.map((a) => (
                    <ArtworkCard
                      key={a.id}
                      artwork={a}
                      variant="search"
                      isSaved={savedIds.has(a.id)}
                      onAdd={() => addToGallery(a)}
                      onOpen={() => setActiveArtwork(a)}
                    />
                  ))}
                </div>
                <SearchSentinel
                  onLoadMore={loadMoreSearch}
                  hasMore={searchHasMore}
                  isLoading={isLoading}
                />
                {isLoading && results.length > 0 && (
                  <p className="text-center text-sm text-black/40 py-4">
                    Loading…
                  </p>
                )}
              </div>
            )}
          </section>
        ) : (
          <Gallery
            items={gallery}
            notes={notes}
            onRemove={removeFromGallery}
            onNoteChange={updateNote}
            onOpen={setActiveArtwork}
          />
        )}
        <footer className="mt-12 border-t border-black/10 pt-6 text-xs text-black/50">
          Data source: Art Institute of Chicago API
        </footer>
      </main>

      <ArtworkModal
        artwork={activeArtwork}
        onClose={() => setActiveArtwork(null)}
      />
    </div>
  );
}
