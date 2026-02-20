import { z } from "zod";
import type { Artwork } from "../schemas/artwork";
import { ArtworkSchema } from "../schemas/artwork";

const GALLERY_KEY = "aic_gallery_v1";
const NOTES_KEY = "aic_notes_v1";

const GallerySchema = z.array(ArtworkSchema).catch([]);
const NotesSchema = z.record(z.string(), z.string()).catch({});

export function loadGallery(): Artwork[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    return GallerySchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveGallery(items: Artwork[]) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

export function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    return NotesSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveNotes(notes: Record<string, string>) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
