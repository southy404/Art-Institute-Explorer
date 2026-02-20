import { useState } from "react";

type Props = {
  onSearch: (q: string) => void;
  isLoading?: boolean;
};

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
    >
      <input
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
        placeholder="Search the collection (e.g. Monet, portrait, blue)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {isLoading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
