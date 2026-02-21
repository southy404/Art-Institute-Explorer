type Props = {
  onSelect: (q: string) => void;
};

const items = [
  "Impressionism",
  "Portrait",
  "Landscape",
  "Abstract",
  "Modern",
  "Sculpture",
  "Still Life",
  "Nature",
];

export default function CategoryRow({ onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="whitespace-nowrap border border-black/15 bg-white px-5 py-3 text-sm hover:border-black"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
