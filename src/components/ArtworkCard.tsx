import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl } from "../api/aic";

type Props = {
  artwork: Artwork;
  variant?: "search" | "gallery";
  isSaved?: boolean;
  note?: string;
  onAdd?: () => void;
  onRemove?: () => void;
  onNoteChange?: (value: string) => void;
};

export default function ArtworkCard({
  artwork,
  variant = "search",
  isSaved,
  note,
  onAdd,
  onRemove,
  onNoteChange,
}: Props) {
  const hasImg = Boolean(artwork.image_id);
  const artist = artwork.artist_title ?? "Unknown artist";

  return (
    <div className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-[4/3] w-full bg-neutral-100">
        {hasImg ? (
          <img
            src={artworkImageUrl(artwork.image_id!, 843)}
            alt={artwork.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
            No image available
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
            {artwork.title}
          </h3>
          <p className="text-xs text-neutral-600">{artist}</p>
        </div>

        {variant === "search" ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-neutral-500">
              ID {artwork.id}
            </span>
            <button
              onClick={onAdd}
              disabled={isSaved}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-900 disabled:opacity-50"
            >
              {isSaved ? "Saved" : "Add to Gallery"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-[11px] font-medium text-neutral-700">
              Note
            </label>
            <textarea
              value={note ?? ""}
              onChange={(e) => onNoteChange?.(e.target.value)}
              placeholder="Add a short curator note…"
              className="min-h-[84px] w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs outline-none focus:border-neutral-900"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                ID {artwork.id}
              </span>
              <button
                onClick={onRemove}
                className="rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
