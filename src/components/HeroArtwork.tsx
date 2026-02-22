import type { Artwork } from "../schemas/artwork";
import { artworkImageUrl } from "../api/aic";

type Props = {
  artwork?: Artwork;
  onOpen?: (a: Artwork) => void;
};

export default function HeroArtwork({ artwork, onOpen }: Props) {
  if (!artwork || !artwork.image_id) return null;

  const artist = artwork.artist_title ?? "Unknown artist";

  return (
    <section className="relative mb-10 h-[48vh] min-h-[320px] w-full overflow-hidden border border-black/10 bg-black">
      {/* IMAGE */}
      <img
        src={artworkImageUrl(artwork.image_id, 843)}
        alt={artwork.title}
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />

      {/* GRADIENT */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* CONTENT */}
      <div className="relative flex h-full items-end">
        <div className="max-w-2xl p-6 text-white sm:p-10">
          <p className="text-[10px] tracking-[0.35em] text-white/70">
            FEATURED ARTWORK
          </p>

          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">
            {artwork.title}
          </h2>

          <p className="mt-2 text-sm text-white/80 sm:text-base">{artist}</p>

          <button
            onClick={() => onOpen?.(artwork)}
            className="mt-5 border border-white/40 px-4 py-2 text-sm hover:border-white"
          >
            View artwork →
          </button>
        </div>
      </div>
    </section>
  );
}
