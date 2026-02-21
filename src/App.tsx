import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import ArtworkCard from "./components/ArtworkCard";
import Gallery from "./components/Gallery";
import ArtworkModal from "./components/ArtworkModal";

import { searchArtworks } from "./api/aic";
import type { Artwork } from "./schemas/artwork";
import { loadGallery, loadNotes, saveGallery, saveNotes } from "./lib/storage";
import { NoteSchema } from "./types";

type Tab = "search" | "gallery";

type Category = {
  label: string;
  query: string;
};

const CATEGORIES: Category[] = [
  { label: "Impressionism", query: "impressionism" },
  { label: "Monet", query: "Monet" },
  { label: "Portrait", query: "portrait" },
  { label: "Abstract", query: "abstract" },
  { label: "Sculpture", query: "sculpture" },
  { label: "Photography", query: "photography" },
];

function SectionTitle({
  eyebrow,
  title,
  hint,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        {eyebrow ? (
          <p className="text-[10px] tracking-[0.28em] text-black/50">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        {hint ? <p className="mt-1 text-sm text-black/60">{hint}</p> : null}
      </div>
    </div>
  );
}

function CategoryRow({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <section className="space-y-3">
      <SectionTitle
        eyebrow="BROWSE"
        title="Explore categories"
        hint="Click a category to load a curated set."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onSelect(c.query)}
            className="group border border-black/15 bg-white px-4 py-4 text-left transition hover:border-black"
          >
            <p className="text-[10px] tracking-[0.28em] text-black/50">
              CATEGORY
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-base font-semibold">{c.label}</span>
              <span className="text-xs text-black/40 group-hover:text-black/70">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ArtworkRow({
  title,
  hint,
  items,
  saved,
  onAdd,
  onOpen,
}: {
  title: string;
  hint?: string;
  items: Artwork[];
  saved: Set<number>;
  onAdd: (a: Artwork) => void;
  onOpen: (a: Artwork) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionTitle eyebrow="CURATED" title={title} hint={hint} />

      <div className="-mx-4 overflow-x-auto px-4 sm:-mx-8 sm:px-8">
        <div className="flex gap-4 pb-2">
          {items.map((a) => (
            <div key={a.id} className="w-[280px] shrink-0">
              <ArtworkCard
                artwork={a}
                variant="search"
                isSaved={saved.has(a.id)}
                onAdd={() => onAdd(a)}
                onOpen={() => onOpen(a)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("search");

  // Home rows
  const [daily, setDaily] = useState<Artwork[]>([]);
  const [monet, setMonet] = useState<Artwork[]>([]);
  const [abstract, setAbstract] = useState<Artwork[]>([]);
  const [portrait, setPortrait] = useState<Artwork[]>([]);

  // Search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Gallery + notes
  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Modal
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const homeAbortRef = useRef<AbortController | null>(null);

  /* ---------- STORAGE ---------- */
  useEffect(() => {
    setGallery(loadGallery());
    setNotes(loadNotes());
  }, []);

  useEffect(() => saveGallery(gallery), [gallery]);
  useEffect(() => saveNotes(notes), [notes]);

  const savedIds = useMemo(() => new Set(gallery.map((g) => g.id)), [gallery]);

  /* ---------- MODAL OPEN ---------- */
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
    if (tab !== "search") return;
    if (query) return;

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
        setDaily(d);
        setMonet(m);
        setAbstract(a);
        setPortrait(p);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
      });

    return () => controller.abort();
  }, [query, tab]);

  /* ---------- SEARCH ---------- */
  async function runSearch(q: string) {
    const trimmed = q.trim();
    setQuery(trimmed);
    setError("");

    abortRef.current?.abort();

    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setResults([]);

    try {
      const data = await searchArtworks(trimmed, controller.signal);
      setResults(data);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
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
        <div className="px-4 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] tracking-[0.28em] text-black/60">
                ART INSTITUTE EXPLORER
              </p>
              <h1 className="truncate text-xl font-semibold">
                Collection Browser
              </h1>
            </div>

            <nav className="flex gap-2">
              <button
                type="button"
                onClick={() => setTab("search")}
                className={`border px-4 py-2 text-sm ${
                  tab === "search"
                    ? "border-black bg-black text-white"
                    : "border-black/15 bg-white hover:border-black"
                }`}
              >
                Search
              </button>

              <button
                type="button"
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
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black/10 px-4 py-10 sm:px-8">
        <h2 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
          A quiet place to collect art.
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-black/60">
          Browse curated rows, open a work in detail view, and save pieces into
          your personal gallery.
        </p>
      </section>

      {/* CONTENT */}
      <main className="px-4 py-8 sm:px-8">
        {tab === "search" ? (
          <section className="space-y-8">
            <SearchBar onSearch={runSearch} isLoading={isLoading} />

            {error ? (
              <div className="border border-black/15 bg-white p-4 text-sm">
                {error}
              </div>
            ) : null}

            {showHome ? (
              <section className="space-y-12">
                <CategoryRow onSelect={runSearch} />

                <ArtworkRow
                  title="Artworks of the Day"
                  hint="A quick sweep of paintings."
                  items={daily}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                />

                <ArtworkRow
                  title="Monet Spotlight"
                  hint="A small selection around Claude Monet."
                  items={monet}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                />

                <ArtworkRow
                  title="Abstract Highlights"
                  hint="Shapes, gestures, and modern experiments."
                  items={abstract}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                />

                <ArtworkRow
                  title="Portrait Study"
                  hint="Faces, identities, and quiet moments."
                  items={portrait}
                  saved={savedIds}
                  onAdd={addToGallery}
                  onOpen={setActiveArtwork}
                />
              </section>
            ) : null}

            {showSearchResults ? (
              <section className="space-y-4">
                <div className="border border-black/10 bg-white p-4">
                  <p className="text-[10px] tracking-[0.28em] text-black/50">
                    SEARCH RESULTS
                  </p>
                  <div className="mt-2 flex items-baseline justify-between gap-4">
                    <h3 className="text-lg font-semibold">“{query}”</h3>
                    <p className="text-sm text-black/50">
                      {isLoading ? "Searching…" : `${results.length} results`}
                    </p>
                  </div>
                </div>

                {!isLoading && results.length === 0 && !error ? (
                  <div className="border border-black/10 bg-white p-6 text-sm text-black/70">
                    No results for “{query}”.
                  </div>
                ) : null}

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
              </section>
            ) : null}
          </section>
        ) : (
          <section className="space-y-6">
            <Gallery
              items={gallery}
              notes={notes}
              onRemove={removeFromGallery}
              onNoteChange={updateNote}
            />
          </section>
        )}

        <footer className="mt-12 border-t border-black/10 pt-6 text-xs text-black/50">
          Data source: Art Institute of Chicago API
        </footer>
      </main>

      {/* MODAL */}
      <ArtworkModal
        artwork={activeArtwork}
        onClose={() => setActiveArtwork(null)}
      />
    </div>
  );
}
