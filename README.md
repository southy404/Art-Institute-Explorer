# Art Institute Explorer

Art Institute Explorer is a minimalist museum-style web app built with React + TypeScript. It lets you browse curated selections from the Art Institute of Chicago collection, search the catalog, open artworks in a rich detail view, and save your own personal collection locally.

## Features

- Curated home view with horizontal “row” sections
- Featured hero artwork (randomized from the curated pool)
- Category tiles with real images that trigger curated searches
- Search experience with dedicated results view
- Artwork detail modal:
  - Large image view
  - Metadata and description panel
  - Lens-style hover zoom (magnifier)
- Personal gallery:
  - Save/remove artworks
  - Curator notes per artwork
  - Persistence via `localStorage` (gallery + notes)

## Tech Stack

- React + TypeScript (Vite)
- Tailwind CSS
- Zod
- Fetch API + AbortController

## Getting Started

```bash
npm install
npm run dev
```

## Data Source

Art Institute of Chicago API
https://api.artic.edu

## Notes on Images

Artwork images are served via the museum’s IIIF service using the image_id returned by the API. Some images may be unavailable, restricted, or replaced over time. The UI handles missing images gracefully.

## License

MIT License
