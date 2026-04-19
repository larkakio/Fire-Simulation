"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applySwipeCoolant,
  createInitialState,
  stepSimulation,
  type GameState,
} from "@/lib/game/engine";
import { LEVELS } from "@/lib/game/levels";
import { loadProgress, unlockNext } from "@/lib/game/progress";
import type { LevelDef } from "@/lib/game/types";
import { Terrain } from "@/lib/game/types";
import { useSwipeGrid } from "@/hooks/useSwipeGrid";

function heatColor(h: number): string {
  if (h < 8) return "rgba(10,20,40,0.85)";
  if (h < 25)
    return `rgba(0, ${80 + h * 3}, ${120 + h}, ${0.35 + h / 200})`;
  if (h < 55)
    return `rgba(${40 + h * 2}, ${20 + h}, 10, ${0.45 + h / 250})`;
  return `rgba(${200 + h * 0.5}, ${30 + h * 0.4}, 10, ${0.65 + h / 400})`;
}

type PlayProps = {
  level: LevelDef;
  onBack: () => void;
  onContinueRequest: (nextLevelId: number) => void;
};

function PlayingField({ level, onBack, onContinueRequest }: PlayProps) {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(level),
  );
  const unlockedRef = useRef(false);

  useEffect(() => {
    unlockedRef.current = false;
  }, [level.id]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((s) => {
        if (s.status !== "playing") return s;
        const next = stepSimulation(s);
        if (
          next.status === "won" &&
          s.status === "playing" &&
          !unlockedRef.current
        ) {
          unlockedRef.current = true;
          unlockNext(level.id);
        }
        return next;
      });
    }, 120);
    return () => window.clearInterval(id);
  }, [level.id]);

  const applyStroke = useCallback(
    (cells: [number, number][]) => {
      setState((s) => {
        if (s.status !== "playing") return s;
        return applySwipeCoolant(s, cells);
      });
    },
    [],
  );

  const swipe = useSwipeGrid(level.cols, level.rows, applyStroke);

  const { cols, rows } = level;
  const { terrain, heat, tank, status, calmTicks, level: lv } = state;
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);

  return (
    <div className="flex flex-col gap-3 px-2 pb-6">
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          onClick={onBack}
          className="rounded border border-zinc-600 px-2 py-1 font-mono text-[10px] uppercase text-zinc-300"
        >
          Missions
        </button>
        <span className="font-mono text-[10px] text-cyan-200/80">
          {lv.name}
        </span>
        <span className="font-mono text-[10px] text-fuchsia-300/80">
          tank {Math.round(tank)}%
        </span>
      </div>

      <div
        {...swipe}
        className="relative mx-auto w-full max-w-[min(100%,420px)] touch-none select-none overflow-hidden rounded-xl border border-cyan-400/40 shadow-[0_0_32px_rgba(0,255,255,0.12),inset_0_0_60px_rgba(168,85,247,0.08)]"
        style={{
          aspectRatio: `${cols} / ${rows}`,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,0.25) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />
        {terrain.map((row, y) =>
          row.map((t, x) => {
            const h = heat[y][x];
            const isCore = t === Terrain.Core;
            const bg = isCore
              ? "radial-gradient(circle at 50% 40%, rgba(236,72,153,0.55), rgba(30,10,40,0.95))"
              : heatColor(h);
            return (
              <div
                key={`${x}-${y}`}
                className="relative min-h-0 min-w-0 border border-black/20"
                style={{ background: bg }}
              >
                {isCore ? (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold uppercase text-white/90">
                    Core
                  </span>
                ) : null}
                {t === Terrain.Stone ? (
                  <span className="absolute inset-0 bg-zinc-800/90" />
                ) : null}
              </div>
            );
          }),
        )}
      </div>

      <div className="px-1 text-center font-mono text-[10px] text-zinc-500">
        calm {calmTicks}/{lv.winHoldTicks} · extinguish below {lv.extinguishBelow}{" "}
        heat
      </div>

      {status === "won" ? (
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-950/50 px-3 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-200">Sector clear</p>
          <p className="mt-1 text-[11px] text-emerald-100/80">
            Next mission unlocked.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-emerald-400/40 py-2 text-xs text-emerald-100"
            onClick={() => {
              if (nextLevel) {
                onContinueRequest(nextLevel.id);
              } else {
                setState(createInitialState(level));
              }
            }}
          >
            {nextLevel ? "Continue" : "Replay"}
          </button>
        </div>
      ) : null}

      {status === "lost" ? (
        <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-3 py-3 text-center">
          <p className="text-sm font-semibold text-red-200">Core breach</p>
          <button
            type="button"
            className="mt-3 w-full rounded-lg border border-red-400/40 py-2 text-xs text-red-100"
            onClick={() => setState(createInitialState(level))}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function FireSimulationGame() {
  const [screen, setScreen] = useState<"select" | "play">("select");
  const [picked, setPicked] = useState(1);

  const level = useMemo(
    () => LEVELS.find((l) => l.id === picked) ?? LEVELS[0],
    [picked],
  );

  const maxUnlocked = loadProgress().maxUnlockedLevel;

  const onContinueRequest = useCallback((nextLevelId: number) => {
    setPicked(nextLevelId);
  }, []);

  if (screen === "select") {
    return (
      <div className="flex flex-col gap-4 px-3 py-4">
        <h2 className="text-center font-mono text-sm uppercase tracking-[0.35em] text-cyan-200/90">
          Missions
        </h2>
        <p className="text-center text-[11px] leading-relaxed text-zinc-400">
          Swipe across the field to spray coolant. Keep the{" "}
          <span className="text-fuchsia-300">core</span> cold and push heat to
          zero.
        </p>
        <ul className="flex flex-col gap-2">
          {LEVELS.map((lv) => {
            const locked = lv.id > maxUnlocked;
            return (
              <li key={lv.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => {
                    setPicked(lv.id);
                    setScreen("play");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-cyan-500/25 bg-gradient-to-r from-black/80 via-cyan-950/20 to-fuchsia-950/20 px-4 py-3 text-left disabled:opacity-35"
                >
                  <span className="font-mono text-xs text-cyan-100">
                    L{lv.id} — {lv.name}
                  </span>
                  {locked ? (
                    <span className="text-[10px] text-zinc-500">Locked</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400/90">Open</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <PlayingField
      key={level.id}
      level={level}
      onBack={() => setScreen("select")}
      onContinueRequest={onContinueRequest}
    />
  );
}
