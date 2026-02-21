import { useEffect, useState } from "react";
import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl, fetchArtworkDetail } from "../api/aic";
import ArtworkLensZoom from "./ArtworkLensZoom";

type Props = {
  artwork: Artwork | null;
  onClose: () => void;
};

export default function ArtworkModal({ artwork, onClose }: Props) {
  const [detail, setDetail] = useState<any>(null);
  const open = Boolean(artwork);

  /* ---------- ESC ---------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  /* ---------- LOAD DETAIL ---------- */

  useEffect(() => {
    if (!artwork) return;

    setDetail(null);

    fetchArtworkDetail(artwork.id)
      .then(setDetail)
      .catch(() => {});
  }, [artwork]);

  if (!artwork) return null;

  const artist = artwork.artist_title ?? "Unknown artist";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative h-[92vh] w-[96vw] overflow-hidden bg-[var(--paper)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid h-full lg:grid-cols-[1.3fr_0.7fr]">
          {/* ---------- IMAGE AREA ---------- */}
          <div className="relative h-full overflow-hidden bg-black/[0.04]">
            {artwork.image_id ? (
              <ArtworkLensZoom
                src={artworkImageUrl(artwork.image_id, 843)}
                alt={artwork.title}
              />
            ) : (
              <div className="text-sm text-black/50">No image available</div>
            )}
          </div>

          {/* ---------- META ---------- */}
          <aside className="flex h-full flex-col overflow-y-auto border-l border-black/10 p-8">
            <p className="text-[11px] tracking-[0.22em] text-black/50">
              ARTWORK
            </p>

            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              {artwork.title}
            </h2>

            <p className="mt-1 text-base text-black/70">{artist}</p>

            {detail ? (
              <>
                {/* description */}
                {detail.description && (
                  <div className="mt-6 border-t border-black/10 pt-6 text-sm leading-relaxed text-black/75">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: detail.description,
                      }}
                    />
                  </div>
                )}

                {/* metadata */}
                <div className="mt-6 space-y-2 border-t border-black/10 pt-6 text-sm text-black/70">
                  {detail.date_display && <p>{detail.date_display}</p>}
                  {detail.medium_display && <p>{detail.medium_display}</p>}
                  {detail.place_of_origin && <p>{detail.place_of_origin}</p>}
                </div>
              </>
            ) : (
              <p className="mt-6 text-sm text-black/40">Loading details…</p>
            )}

            <div className="mt-auto text-xs text-black/40">
              Art Institute of Chicago
            </div>
          </aside>
        </div>

        {/* close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 border border-black/15 bg-white px-3 py-1 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
