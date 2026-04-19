import type { LevelDef } from "./types";
import { Terrain } from "./types";

function emptyTerrain(
  cols: number,
  rows: number,
  core: [number, number],
): Terrain[][] {
  const g: Terrain[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: Terrain[] = [];
    for (let x = 0; x < cols; x++) {
      row.push(Terrain.Fuel);
    }
    g.push(row);
  }
  const [cx, cy] = core;
  g[cy][cx] = Terrain.Core;
  // Stone border noise
  for (let x = 0; x < cols; x++) {
    if (x % 4 === 0) g[0][x] = Terrain.Stone;
    if (x % 5 === 2) g[rows - 1][x] = Terrain.Stone;
  }
  return g;
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "Neon Ember",
    cols: 9,
    rows: 12,
    initialHeat: 62,
    fireSeeds: [
      [2, 2],
      [6, 2],
    ],
    core: [4, 10],
    wind: { dx: 0, dy: 0 },
    spread: 0.34,
    extinguishBelow: 10,
    winHoldTicks: 22,
    coolantPerCell: 44,
    tankMax: 100,
    tankRefillPerSec: 26,
    coreFailHeat: 58,
  },
  {
    id: 2,
    name: "Thermal Drift",
    cols: 10,
    rows: 14,
    initialHeat: 78,
    fireSeeds: [
      [1, 3],
      [8, 3],
      [4, 1],
    ],
    core: [5, 12],
    wind: { dx: 1, dy: 0 },
    spread: 0.48,
    extinguishBelow: 10,
    winHoldTicks: 32,
    coolantPerCell: 34,
    tankMax: 100,
    tankRefillPerSec: 20,
    coreFailHeat: 52,
  },
  {
    id: 3,
    name: "Plasma Storm",
    cols: 11,
    rows: 15,
    initialHeat: 85,
    fireSeeds: [
      [2, 2],
      [8, 2],
      [5, 4],
      [3, 6],
    ],
    core: [5, 13],
    wind: { dx: 1, dy: 1 },
    spread: 0.55,
    extinguishBelow: 12,
    winHoldTicks: 36,
    coolantPerCell: 30,
    tankMax: 100,
    tankRefillPerSec: 18,
    coreFailHeat: 48,
  },
];

export function getTerrainForLevel(level: LevelDef): Terrain[][] {
  const t = emptyTerrain(level.cols, level.rows, level.core);
  return t;
}
