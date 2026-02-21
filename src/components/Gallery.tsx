import type { Artwork } from "../schemas/artwork";
import ArtworkCard from "./ArtworkCard";

type Props = {
  items: Artwork[];
  notes: Record<string, string>;
  onRemove: (id: number) => void;
  onNoteChange: (id: number, value: string) => void;
};

export default function Gallery({
  items,
  notes,
  onRemove,
  onNoteChange,
}: Props) {
  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <div className="border border-black/10 bg-white p-6">
          <p className="text-[10px] tracking-[0.28em] text-black/50">
            PERSONAL COLLECTION
          </p>

          <h2 className="mt-2 text-xl font-semibold">Your gallery is empty</h2>

          <p className="mt-2 max-w-md text-sm text-black/60">
            Save artworks from search or curated rows. Your personal selection
            lives locally on this device.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* curator intro */}
      <div className="border border-black/10 bg-white p-6">
        <p className="text-[10px] tracking-[0.28em] text-black/50">
          PERSONAL COLLECTION
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Saved artworks</h2>
            <p className="mt-1 text-sm text-black/60">
              A quiet archive of pieces you selected.
            </p>
          </div>

          <p className="text-sm text-black/50">{items.length} works saved</p>
        </div>
      </div>

      {/* grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {items.map((a) => (
          <ArtworkCard
            key={a.id}
            artwork={a}
            variant="gallery"
            note={notes[String(a.id)] ?? ""}
            onRemove={() => onRemove(a.id)}
            onNoteChange={(v) => onNoteChange(a.id, v)}
          />
        ))}
      </div>
    </section>
  );
}
