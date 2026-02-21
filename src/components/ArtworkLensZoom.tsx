import { useRef, useState } from "react";

type Props = {
  src: string;
  alt?: string;
};

export default function ArtworkLensZoom({ src, alt }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [lens, setLens] = useState({ x: 0, y: 0, show: false });

  const size = 300;
  const zoom = 3;

  function move(e: React.MouseEvent) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setLens({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      show: true,
    });
  }

  const imgRect = imgRef.current?.getBoundingClientRect();
  const containerRect = containerRef.current?.getBoundingClientRect();

  let offsetX = 0;
  let offsetY = 0;
  let imgWidth = 0;
  let imgHeight = 0;

  if (imgRect && containerRect) {
    offsetX = imgRect.left - containerRect.left;
    offsetY = imgRect.top - containerRect.top;
    imgWidth = imgRect.width;
    imgHeight = imgRect.height;
  }

  const imgX = (lens.x - offsetX) * zoom;
  const imgY = (lens.y - offsetY) * zoom;

  return (
    <div
      ref={containerRef}
      onMouseMove={move}
      onMouseEnter={() => setLens((p) => ({ ...p, show: true }))}
      onMouseLeave={() => setLens((p) => ({ ...p, show: false }))}
      className="relative flex h-full w-full cursor-none items-center justify-center overflow-hidden bg-gray-50/50"
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="max-h-full max-w-full shadow-md"
      />

      {lens.show && imgWidth > 0 && (
        <div
          className="pointer-events-none absolute overflow-hidden rounded-full border border-white/80 bg-white shadow-2xl"
          style={{
            width: size,
            height: size,
            left: lens.x - size / 2,
            top: lens.y - size / 2,
          }}
        >
          <img
            src={src}
            alt=""
            className="absolute max-w-none"
            style={{
              width: imgWidth * zoom,
              height: imgHeight * zoom,
              left: -(imgX - size / 2),
              top: -(imgY - size / 2),
            }}
          />
        </div>
      )}
    </div>
  );
}
