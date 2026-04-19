/** Terrain only — fire is tracked separately via heat. */
export enum Terrain {
  Empty = 0,
  Fuel = 1,
  Stone = 2,
  Core = 3,
}

export type Wind = { dx: number; dy: number };

export type LevelDef = {
  id: number;
  name: string;
  cols: number;
  rows: number;
  /** Initial heat 0–100 per cell (only on fuel). */
  initialHeat: number;
  /** Cells that start with fire seeds. */
  fireSeeds: [number, number][];
  /** Core cell position — lose if heat here exceeds threshold. */
  core: [number, number];
  wind: Wind;
  /** Spread probability multiplier per tick. */
  spread: number;
  /** Win when max heat in grid stays below this for `winHoldTicks` ticks. */
  extinguishBelow: number;
  winHoldTicks: number;
  /** Coolant applied per cell along swipe (0–100). */
  coolantPerCell: number;
  /** Max coolant tank; refills per second. */
  tankMax: number;
  tankRefillPerSec: number;
  /** Lose if core heat > this. */
  coreFailHeat: number;
};

export type GameStatus = "playing" | "won" | "lost";
