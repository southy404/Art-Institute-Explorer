import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl } from "../api/aic";

type Tile = {
  label: string;
  query: string;
  artwork?: Artwork;
};

type Props = {
  tiles: Tile[];
  onSelect: (query: string) => void;
};

export default function CategoryTiles({ tiles, onSelect }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t) => (
        <button
          key={t.label}
          onClick={() => onSelect(t.query)}
          className="group relative h-40 overflow-hidden border border-black/10 text-left"
        >
          {/* IMAGE */}
          {t.artwork?.image_id && (
            <img
              src={artworkImageUrl(t.artwork.image_id, 843)}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50" />

          {/* LABEL */}
          <div className="relative flex h-full items-end p-4 text-white">
            <div>
              <p className="text-[10px] tracking-[0.35em] text-white/70">
                CATEGORY
              </p>
              <h3 className="mt-1 text-xl font-semibold">{t.label}</h3>
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
