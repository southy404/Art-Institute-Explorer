import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl } from "../api/aic";

type Props = {
  artwork: Artwork;
  variant?: "search" | "gallery";
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

  return (
    <article
      onClick={() => onOpen?.(artwork)}
      className="group cursor-pointer border border-black/10 bg-white transition hover:border-black/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
    >
      {/* IMAGE */}
      <div className="aspect-[4/3] w-full bg-black/[0.03]">
        {hasImg ? (
          <img
            src={artworkImageUrl(artwork.image_id!, 843)}
            alt={artwork.title}
            loading="lazy"
            className="h-full w-full object-cover cursor-zoom-in"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-black/50">
            No image available
          </div>
        )}
      </div>

      {/* META */}
      <div className="p-4">
        <p className="text-[10px] tracking-[0.22em] text-black/50">ARTWORK</p>

        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug">
          {artwork.title}
        </h3>

        <p className="mt-1 text-sm text-black/65">{artist}</p>

        {/* ACTION ROW */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/10 pt-3">
          <span className="text-xs text-black/50">ID {artwork.id}</span>

          {variant === "search" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
              disabled={isSaved}
              className="rounded-none border border-black/15 bg-white px-3 py-2 text-xs font-medium hover:border-black disabled:opacity-50"
            >
              {isSaved ? "Saved" : "Add"}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="rounded-none border border-black bg-black px-3 py-2 text-xs font-medium text-white"
            >
              Remove
            </button>
          )}
        </div>

        {/* NOTE */}
        {variant === "gallery" ? (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <label className="block text-[10px] tracking-[0.22em] text-black/50">
              CURATOR NOTE
            </label>

            <textarea
              value={note ?? ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onNoteChange?.(e.target.value)
              }
              placeholder="Add a short curator note…"
              className="mt-2 min-h-[96px] w-full resize-none rounded-none border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
