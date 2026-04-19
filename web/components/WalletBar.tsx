"use client";

import { useEffect, useState } from "react";
import { base } from "wagmi/chains";
import {
  useChainId,
  useConnect,
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

export function WalletBar() {
  const { address, isConnected } = useConnection();
  const chainId = useChainId();
  const { connectAsync, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrong = isConnected && chainId !== base.id;

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  return (
    <header className="relative z-40 border-b border-cyan-500/30 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-3 py-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/90">
          Base · Fire Sim
        </span>
        <div className="flex items-center gap-2">
          {isConnected && address ? (
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded border border-fuchsia-500/50 bg-fuchsia-950/40 px-2 py-1 font-mono text-[11px] text-fuchsia-200"
            >
              {address.slice(0, 6)}…{address.slice(-4)}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              disabled={isConnecting}
              className="rounded border border-cyan-400/60 bg-cyan-950/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
            >
              {isConnecting ? "…" : "Connect wallet"}
            </button>
          )}
        </div>
      </div>

      {wrong ? (
        <div className="border-t border-amber-500/40 bg-amber-950/50 px-3 py-2 text-center">
          <p className="text-[11px] text-amber-100">
            Wrong network — switch to Base to play on-chain features.
          </p>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
            className="mt-1 text-[11px] font-semibold text-amber-300 underline"
          >
            {isSwitching ? "Switching…" : "Switch to Base"}
          </button>
        </div>
      ) : null}

      {sheetOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          role="presentation"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="max-h-[70vh] overflow-auto rounded-t-2xl border border-cyan-500/30 bg-zinc-950 p-4 shadow-[0_-8px_40px_rgba(0,255,255,0.12)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Choose wallet"
          >
            <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-cyan-200/80">
              Connect
            </p>
            <ul className="flex flex-col gap-2">
              {connectors.map((connector) => (
                <li key={connector.uid}>
                  <button
                    type="button"
                    disabled={false}
                    onClick={async () => {
                      try {
                        await connectAsync({ connector, chainId: base.id });
                        setSheetOpen(false);
                      } catch {
                        /* user rejected */
                      }
                    }}
                    className="w-full rounded-lg border border-cyan-500/25 bg-black/50 py-3 text-left text-sm text-cyan-100 hover:border-cyan-400/60 disabled:opacity-40"
                  >
                    {connector.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 w-full py-2 text-xs text-zinc-500"
              onClick={() => setSheetOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
