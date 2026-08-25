/**
 * folder-embroidery/patches.ts
 * Word patch definitions and color configurations
 */

export type WordPatch = {
  word: string;
  cx: number;
  cy: number;
  scale: number;
  rotDeg: number;
  fill: [number, number, number];
  ink: [number, number, number];
  border: [number, number, number];
  stitchDeg: number;
};

export const WORDS: WordPatch[] = [
  {
    word: "Wake",
    cx: 0.44,
    cy: 0.30,
    scale: 0.26,
    rotDeg: -4,
    fill: [0.42, 0.62, 0.92], // Cyan-blue cloth patch
    ink: [0.09, 0.09, 0.1],   // Dark satin lettering
    border: [0.97, 0.97, 0.98], // White merrowed border bead
    stitchDeg: 70,
  },
  {
    word: "Up",
    cx: 0.58,
    cy: 0.49,
    scale: 0.24,
    rotDeg: 3,
    fill: [0.96, 0.82, 0.36], // Golden cloth patch
    ink: [0.09, 0.09, 0.1],
    border: [0.98, 0.98, 0.96],
    stitchDeg: 20,
  },
  {
    word: "Nola!",
    cx: 0.48,
    cy: 0.68,
    scale: 0.28,
    rotDeg: -2,
    fill: [0.9, 0.62, 0.82], // Violet/rose cloth patch
    ink: [0.09, 0.09, 0.1],
    border: [0.98, 0.97, 0.98],
    stitchDeg: 100,
  },
];

export const FABRIC: [number, number, number] = [0.16, 0.13, 0.2];
