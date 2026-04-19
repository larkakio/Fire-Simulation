"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { base } from "wagmi/chains";
import {
  useChainId,
  useConnect,
  useConnectors,
  useConnection,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

export function WalletBar() {
  const { address, isConnected } = useConnection();
  const chainId = useChainId();
  const { connectAsync, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const wrong = isConnected && chainId !== base.id;

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const sheet =
    sheetOpen && isClient ? (
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/75 backdrop-blur-sm"
        role="presentation"
        style={{ WebkitTapHighlightColor: "transparent" }}
        onClick={() => setSheetOpen(false)}
      >
        <div
          className="max-h-[75vh] overflow-auto rounded-t-2xl border border-cyan-500/30 bg-zinc-950 p-4 pb-6 shadow-[0_-8px_40px_rgba(0,255,255,0.12)]"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="Choose wallet"
          aria-modal="true"
        >
          <p className="mb-3 text-center font-mono text-xs uppercase tracking-widest text-cyan-200/80">
            Connect
          </p>
          {connectors.length === 0 ? (
            <p className="px-2 text-center text-[12px] leading-relaxed text-zinc-400">
              No wallet connectors yet. Try again in a moment, open this page in
              the Base app, or install a browser wallet (e.g. MetaMask).
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {connectors.map((connector) => (
                <li key={connector.uid}>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await connectAsync({ connector, chainId: base.id });
                        setSheetOpen(false);
                      } catch {
                        /* user rejected */
                      }
                    }}
                    className="w-full rounded-lg border border-cyan-500/25 bg-black/50 py-3.5 text-left text-sm text-cyan-100 hover:border-cyan-400/60 active:bg-cyan-950/40"
                  >
                    {connector.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="mt-4 w-full touch-manipulation py-3 text-xs text-zinc-500"
            onClick={() => setSheetOpen(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    ) : null;

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
              className="touch-manipulation rounded border border-cyan-400/60 bg-cyan-950/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
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

      {sheet ? createPortal(sheet, document.body) : null}
    </header>
  );
}
