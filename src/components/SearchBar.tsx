import { useState } from "react";

type Props = {
  onSearch: (q: string) => void;
  isLoading?: boolean;
};

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [value, setValue] = useState("");

  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
    >
      <input
        className="h-12 w-full rounded-none border border-black/15 bg-white px-4 text-sm outline-none placeholder:text-black/40 focus:border-black"
        placeholder="Search the collection (e.g. Monet, portrait, blue)"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
      />
      <button
        type="submit"
        disabled={isLoading}
        className="h-12 rounded-none border border-black bg-black px-5 text-sm font-medium text-white disabled:opacity-60"
      >
        {isLoading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
