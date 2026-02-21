import type { Artwork } from "../schemas/artwork";
import ArtworkCard from "./ArtworkCard";

type Props = {
  title: string;
  items: Artwork[];
  onOpen: (a: Artwork) => void;
  onAdd: (a: Artwork) => void;
  saved: Set<number>;
};

export default function ArtworkRow({
  title,
  items,
  onOpen,
  onAdd,
  saved,
}: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.map((a) => (
          <div className="min-w-[260px]" key={a.id}>
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
    </section>
  );
}
