const KEY = "fire_sim_progress_v1";

export type Progress = {
  maxUnlockedLevel: number;
};

export function loadProgress(): Progress {
  if (typeof window === "undefined") return { maxUnlockedLevel: 1 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { maxUnlockedLevel: 1 };
    const p = JSON.parse(raw) as Progress;
    if (typeof p.maxUnlockedLevel !== "number" || p.maxUnlockedLevel < 1) {
      return { maxUnlockedLevel: 1 };
    }
    return p;
  } catch {
    return { maxUnlockedLevel: 1 };
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function unlockNext(currentLevelId: number) {
  const cur = loadProgress();
  const next = Math.max(cur.maxUnlockedLevel, currentLevelId + 1);
  saveProgress({ maxUnlockedLevel: next });
}
