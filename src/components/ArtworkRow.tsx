import type { Artwork } from "../schemas/artwork";
import ArtworkCard from "./ArtworkCard";
import { useGrabScroll } from "../hooks/useGrabScroll";

type Props = {
  title: string;
  hint?: string;
  query: string;
  items: Artwork[];
  onOpen: (a: Artwork) => void;
  onAdd: (a: Artwork) => void;
  onSeeAll: (query: string) => void;
  saved: Set<number>;
};

export default function ArtworkRow({
  title,
  query,
  items,
  onOpen,
  onAdd,
  onSeeAll,
  saved,
}: Props) {
  const { ref, isDragging } = useGrabScroll();

  const validItems = items.filter(Boolean);
  if (!validItems.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-black/50">CURATED</p>
          <h3 className="mt-1 text-xl font-semibold">{title}</h3>
        </div>
        <button
          onClick={() => onSeeAll(query)}
          className="text-xs tracking-[0.18em] text-black/50 hover:text-black transition-colors"
        >
          SEE ALL →
        </button>
      </div>

      <div className="-mx-4 sm:-mx-8">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-8 scrollbar-none cursor-grab select-none"
        >
          {validItems.map((a) => (
            <div key={a.id} className="w-[280px] shrink-0">
              <ArtworkCard
                artwork={a}
                variant="search"
                isSaved={saved.has(a.id)}
                onAdd={() => onAdd(a)}
                onOpen={(art) => {
                  if (!isDragging.current) onOpen(art);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
