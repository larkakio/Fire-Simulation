"use client";

import { base } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { checkInAbi } from "@/lib/contracts/checkInAbi";
import { publicEnv } from "@/lib/env";
import { getBuilderDataSuffix } from "@/lib/builderSuffix";

export function CheckInPanel() {
  const { isConnected } = useConnection();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const addr = publicEnv.checkInContract;
  const baseId = base.id;
  const wrong = isConnected && chainId !== baseId;
  const busy = isSwitching || isWriting;

  async function onCheckIn() {
    if (!addr) return;
    if (chainId !== baseId) {
      await switchChainAsync({ chainId: baseId });
    }
    const dataSuffix = getBuilderDataSuffix();
    await writeContractAsync({
      address: addr,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: baseId,
      ...(dataSuffix ? { dataSuffix } : {}),
    });
  }

  if (!isConnected) {
    return (
      <p className="text-center text-[11px] text-zinc-500">
        Connect a wallet to check in on-chain (Base).
      </p>
    );
  }

  if (!addr) {
    return (
      <p className="text-center text-[11px] text-amber-200/90">
        Set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS after deploying the contract.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {wrong ? (
        <p className="text-center text-[11px] text-amber-200/90">
          Switch to Base before checking in.
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          void onCheckIn().catch(() => {
            /* wallet rejected */
          });
        }}
        className="w-full max-w-xs rounded-lg border border-emerald-400/50 bg-emerald-950/40 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)] disabled:opacity-50"
      >
        {busy ? "Please wait…" : "Daily check-in"}
      </button>
    </div>
  );
}
