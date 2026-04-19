import { CheckInPanel } from "@/components/CheckInPanel";
import { FireSimulationGame } from "@/components/game/FireSimulationGame";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-cyan-500/20 px-4 py-6 text-center">
        <h1 className="neon-pulse font-display text-2xl font-bold uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-pink-300">
          Fire Simulation
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
          Drag across the grid to deploy coolant. Stabilize the sector before the
          core melts.
        </p>
      </section>

      <FireSimulationGame />

      <section className="mt-auto border-t border-fuchsia-500/20 px-4 py-6">
        <h2 className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80">
          On-chain
        </h2>
        <CheckInPanel />
      </section>
    </div>
  );
}
