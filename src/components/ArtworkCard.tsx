import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl } from "../api/aic";

type Props = {
  artwork: Artwork;
  variant?: "search" | "gallery" | "row";
  isSaved?: boolean;
  note?: string;
  onAdd?: () => void;
  onOpen?: (artwork: Artwork) => void;
  onRemove?: () => void;
  onNoteChange?: (value: string) => void;
};

export default function ArtworkCard({
  artwork,
  variant = "search",
  isSaved,
  note,
  onAdd,
  onOpen,
  onRemove,
  onNoteChange,
}: Props) {
  const hasImg = Boolean(artwork.image_id);
  const artist = artwork.artist_title ?? "Unknown artist";

  const isRow = variant === "row";
  const isGallery = variant === "gallery";

  return (
    <article
      onClick={() => onOpen?.(artwork)}
      className="
        group cursor-pointer border border-black/10 bg-white
        transition hover:border-black/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        flex flex-col
      "
    >
      {/* IMAGE */}
      <div
        className={`
          w-full bg-black/[0.03] shrink-0
          ${isRow ? "h-[180px]" : ""}
          ${variant === "search" ? "h-[260px]" : ""}
          ${isGallery ? "h-[220px]" : ""}
        `}
      >
        {hasImg ? (
          <img
            src={artworkImageUrl(artwork.image_id!, 843)}
            alt={artwork.title}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover cursor-zoom-in"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-black/50">
            No image available
          </div>
        )}
      </div>

      {/* META */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] tracking-[0.22em] text-black/50">ARTWORK</p>

        <h3
          className={`
            mt-2 font-semibold leading-snug
            ${isRow ? "line-clamp-1 text-sm" : "line-clamp-2 text-base"}
          `}
        >
          {artwork.title}
        </h3>

        <p className="mt-1 text-sm text-black/65">{artist}</p>

        <div className="flex-1" />

        {/* ACTION */}
        <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
          <span className="text-xs text-black/50">ID {artwork.id}</span>

          {variant !== "gallery" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
              disabled={isSaved}
              className="border border-black/15 px-3 py-2 text-xs hover:border-black disabled:opacity-50"
            >
              {isSaved ? "Saved" : "Add"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="border border-black bg-black text-white px-3 py-2 text-xs"
            >
              Remove
            </button>
          )}
        </div>

        {/* NOTE (nur gallery) */}
        {isGallery && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] tracking-[0.22em] text-black/50">
              CURATOR NOTE
            </label>

            <textarea
              value={note ?? ""}
              onChange={(e) => onNoteChange?.(e.target.value)}
              className="mt-2 min-h-[90px] w-full resize-none border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        )}
      </div>
    </article>
  );
}
