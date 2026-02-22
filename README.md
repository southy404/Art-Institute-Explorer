# Art Institute Explorer

Art Institute Explorer is a minimalist museum-style web app built with React + TypeScript. It lets you browse curated selections from the Art Institute of Chicago collection, search the catalog, open artworks in a rich detail view, and save your own personal collection locally.

## Features

**Discovery**

- Curated home view with horizontal scrollable rows (Paintings, Monet, Abstract, Portraits)
- Grab-to-scroll interaction on all artwork rows (drag with mouse)
- "See All" per row with infinite scroll browse view
- Featured hero artwork, randomized from the curated pool
- Category tiles with real artwork images that trigger curated searches

**Search**

- Full-text search against the AIC catalog
- Infinite scroll – loads 24 results at a time, continues until exhausted

**Artwork Detail**

- Large image view with lens-style hover zoom (magnifier)
- Metadata panel: title, artist, date, medium, place of origin
- Description panel (where available)

**Personal Gallery**

- Save and remove artworks
- Curator notes per artwork (freetext)

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
