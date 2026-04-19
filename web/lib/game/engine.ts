import type { GameStatus, LevelDef } from "./types";
import { Terrain } from "./types";
import { getTerrainForLevel } from "./levels";

export type GameState = {
  level: LevelDef;
  terrain: Terrain[][];
  heat: number[][];
  wet: number[][];
  tank: number;
  tick: number;
  status: GameStatus;
  /** Consecutive ticks under extinguish threshold */
  calmTicks: number;
};

const MAX_HEAT = 100;

export function createInitialState(level: LevelDef): GameState {
  const terrain = getTerrainForLevel(level);
  const rows = level.rows;
  const cols = level.cols;
  const heat: number[][] = [];
  const wet: number[][] = [];
  for (let y = 0; y < rows; y++) {
    heat.push(new Array(cols).fill(0));
    wet.push(new Array(cols).fill(0));
  }

  for (const [fx, fy] of level.fireSeeds) {
    if (terrain[fy][fx] === Terrain.Fuel) {
      heat[fy][fx] = level.initialHeat;
    }
  }

  return {
    level,
    terrain,
    heat,
    wet,
    tank: level.tankMax,
    tick: 0,
    status: "playing",
    calmTicks: 0,
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/** Bresenham line between two grid points — inclusive. */
export function rasterizeLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  cols: number,
  rows: number,
): [number, number][] {
  const out: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      out.push([x, y]);
    }
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
  return out;
}

export function applySwipeCoolant(
  state: GameState,
  cells: [number, number][],
): GameState {
  if (state.status !== "playing") return state;
  const { level, wet, heat, terrain, tank } = state;
  let remaining = tank;
  const wetNext = wet.map((row) => row.slice());
  const heatNext = heat.map((row) => row.slice());
  const per = level.coolantPerCell;

  for (const [cx, cy] of cells) {
    if (remaining < per * 0.25) break;
    const t = terrain[cy][cx];
    if (t === Terrain.Stone) continue;
    remaining -= per * 0.35;
    wetNext[cy][cx] = clamp(wetNext[cy][cx] + per, 0, MAX_HEAT);
    if (t === Terrain.Fuel || t === Terrain.Empty) {
      heatNext[cy][cx] = Math.max(0, heatNext[cy][cx] - per * 0.9);
    }
    if (t === Terrain.Core) {
      heatNext[cy][cx] = Math.max(0, heatNext[cy][cx] - per * 1.1);
    }
  }

  return {
    ...state,
    wet: wetNext,
    heat: heatNext,
    tank: clamp(remaining, 0, level.tankMax),
  };
}

export function stepSimulation(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const { level, terrain, heat, wet } = state;
  const rows = level.rows;
  const cols = level.cols;
  const wind = level.wind;

  const heatNext = heat.map((row) => row.slice());
  const wetNext = wet.map((row) => row.slice());

  // Refill tank
  const dt = 1 / 12; // ~12 ticks per second caller
  const tank = clamp(
    state.tank + level.tankRefillPerSec * dt,
    0,
    level.tankMax,
  );

  // Wet decay + cooling
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const w = wetNext[y][x];
      if (w > 0) {
        const decay = 4.2;
        wetNext[y][x] = Math.max(0, w - decay);
        const cool = w * 0.08;
        heatNext[y][x] = Math.max(0, heatNext[y][x] - cool);
      }
    }
  }

  // Fire spread
  const spreadBase = level.spread * 11;
  const dirs: [number, number][] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const h = heatNext[y][x];
      if (h < 18) continue;
      const t = terrain[y][x];
      if (t === Terrain.Stone) continue;

      for (const [dx, dy] of dirs) {
        const ax = dx + wind.dx * 0.35;
        const ay = dy + wind.dy * 0.35;
        const nx = Math.round(x + ax);
        const ny = Math.round(y + ay);
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const nt = terrain[ny][nx];
        if (nt === Terrain.Stone) continue;
        if (nt === Terrain.Empty && h < 40) continue;

        const nh = heatNext[ny][nx];
        const jitter =
          (((x * 17 + y * 31 + state.tick * 13) % 17) / 17) * 0.2;
        const transfer =
          spreadBase *
          (h / MAX_HEAT) *
          (0.35 + jitter) *
          (nt === Terrain.Fuel ? 1.15 : nt === Terrain.Core ? 0.85 : 0.6);

        if (nh + transfer > heatNext[ny][nx]) {
          heatNext[ny][nx] = clamp(nh + transfer * 0.22, 0, MAX_HEAT);
        }
      }

      // Direct neighbor spread (stable)
      for (const [dx, dy] of dirs.slice(0, 4)) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
        const nt = terrain[ny][nx];
        if (nt === Terrain.Stone) continue;
        const nh = heatNext[ny][nx];
        const push = spreadBase * (h / MAX_HEAT) * 0.18;
        if (h > 28 && nh < h - 6) {
          heatNext[ny][nx] = clamp(nh + push, 0, MAX_HEAT);
        }
      }
    }
  }

  // Lose: core
  const [cx, cy] = level.core;
  let status: GameStatus = "playing";
  if (heatNext[cy][cx] >= level.coreFailHeat) {
    status = "lost";
  }

  // Win: grid calm
  let maxH = 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (terrain[y][x] === Terrain.Stone) continue;
      maxH = Math.max(maxH, heatNext[y][x]);
    }
  }

  let calmTicks = state.calmTicks;
  if (maxH < level.extinguishBelow) {
    calmTicks += 1;
  } else {
    calmTicks = 0;
  }

  if (calmTicks >= level.winHoldTicks && status === "playing") {
    status = "won";
  }

  return {
    ...state,
    heat: heatNext,
    wet: wetNext,
    tank,
    tick: state.tick + 1,
    status,
    calmTicks,
  };
}
