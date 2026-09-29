// Plate values from the mockup's print-plates.js (Broadsheet design system).
// INK is the brand separation printed at rest; TRUE is the pure-process
// factorization whose four plates multiply back to the source exactly, so
// easing INK→TRUE as the plates register lands the merged print on the photo.

export type Plate = "c" | "m" | "y" | "k";

export const INK: Record<Plate, number[]> = {
  c: [1, 0, 0, 0, 0, 0.467, 0, 0, 0, 0.533, 0.31, 0, 0, 0, 0.69, 0, 0, 0, 0, 1],
  m: [0, 0.161, 0, 0, 0.839, 0, 1, 0, 0, 0, 0, 0.576, 0, 0, 0.424, 0, 0, 0, 0, 1],
  y: [0, 0, 0.071, 0, 0.929, 0, 0, 0.267, 0, 0.733, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  k: [
    0.112, 0.375, 0.038, 0, 0.475, 0.113, 0.379, 0.038, 0, 0.471, 0.113, 0.38, 0.038, 0, 0.468, 0,
    0, 0, 0, 1,
  ],
};

export const TRUE: Record<Plate, number[]> = {
  c: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  m: [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  y: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  k: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
};

/** Resting misregistration in px for the moving plates (C holds at 0,0). */
export const OFFSETS: Record<Exclude<Plate, "c">, [number, number]> = {
  m: [5, 3],
  y: [-5, -3],
  k: [3, 6],
};

export const matrix = (values: number[]) => values.join(" ");
