import { useEffect, useMemo, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import ArtworkCard from "./components/ArtworkCard";
import Gallery from "./components/Gallery";
import { searchArtworks } from "./api/aic";
import type { Artwork } from "./schemas/artwork";
import { loadGallery, loadNotes, saveGallery, saveNotes } from "./lib/storage";
import { NoteSchema } from "./types";

export default function App() {
  const [tab, setTab] = useState<"search" | "gallery">("search");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [gallery, setGallery] = useState<Artwork[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setGallery(loadGallery());
    setNotes(loadNotes());
  }, []);

  useEffect(() => {
    saveGallery(gallery);
  }, [gallery]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const savedIds = useMemo(() => new Set(gallery.map((g) => g.id)), [gallery]);

  async function runSearch(q: string) {
    const trimmed = q.trim();
    setQuery(trimmed);
    setError("");
    setResults([]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (!trimmed) return;

    setIsLoading(true);
    try {
      const data = await searchArtworks(trimmed, abortRef.current.signal);
      setResults(data);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }

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
    const safe = NoteSchema.parse(value); // Zod validation
    setNotes((prev) => ({ ...prev, [String(id)]: safe }));
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.2em] text-neutral-500">
              ART INSTITUTE EXPLORER
            </p>
            <h1 className="text-3xl font-semibold leading-tight">
              A quiet place to collect art.
            </h1>
            <p className="max-w-xl text-sm text-neutral-600">
              Search the Art Institute of Chicago collection, save favourites,
              and add curator notes.
            </p>
          </div>

          <nav className="flex rounded-2xl border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setTab("search")}
              className={`rounded-2xl px-4 py-2 text-sm ${
                tab === "search"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700"
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setTab("gallery")}
              className={`rounded-2xl px-4 py-2 text-sm ${
                tab === "gallery"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700"
              }`}
            >
              Gallery ({gallery.length})
            </button>
          </nav>
        </header>

        {tab === "search" ? (
          <section className="space-y-6">
            <SearchBar onSearch={runSearch} isLoading={isLoading} />

            {error ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                <span className="font-medium">Error:</span> {error}
              </div>
            ) : null}

            {!query ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
                Try searching for an artist, style, or subject. Example:{" "}
                <span className="font-medium">“Van Gogh”</span>
              </div>
            ) : null}

            {query && !isLoading && results.length === 0 && !error ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
                No results for <span className="font-medium">“{query}”</span>.
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArtworkCard
                  key={a.id}
                  artwork={a}
                  variant="search"
                  isSaved={savedIds.has(a.id)}
                  onAdd={() => addToGallery(a)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold">Personal Gallery</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Your saved works live in localStorage on this device.
              </p>
            </div>

            <Gallery
              items={gallery}
              notes={notes}
              onRemove={removeFromGallery}
              onNoteChange={updateNote}
            />
          </section>
        )}

        <footer className="mt-10 text-xs text-neutral-500">
          Data source: Art Institute of Chicago API.
        </footer>
      </div>
    </div>
  );
}
