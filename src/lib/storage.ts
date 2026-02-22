import { z } from "zod";
import type { Artwork } from "../schemas/artwork";
import { ArtworkSchema } from "../schemas/artwork";

const GALLERY_KEY = "aic_gallery_v1";
const NOTES_KEY = "aic_notes_v1";

const GallerySchema = z.array(ArtworkSchema).catch([]);
const NotesSchema = z.record(z.string(), z.string()).catch({});

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadGallery(): Artwork[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    return GallerySchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveGallery(items: Artwork[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
}

export function loadNotes(): Record<string, string> {
  if (!isBrowser()) return {};

  try {
    const raw = window.localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    return NotesSchema.parse(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveNotes(notes: Record<string, string>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}
