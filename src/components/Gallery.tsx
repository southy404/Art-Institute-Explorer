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
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600">
        Your gallery is empty. Add artworks from the search results.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
