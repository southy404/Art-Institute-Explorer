import { z } from "zod";

export const NoteSchema = z
  .string()
  .trim()
  .max(240, "Max 240 characters")
  .catch("");

export type Note = z.infer<typeof NoteSchema>;
