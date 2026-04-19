import type { Hex } from "viem";
import { Attribution } from "ox/erc8021";
import { publicEnv } from "@/lib/env";

/** ERC-8021 calldata suffix for Builder Code attribution (Base). */
export function getBuilderDataSuffix(): Hex | undefined {
  const override = publicEnv.builderCodeSuffix;
  if (override && override.length > 2) {
    return override;
  }
  const code = publicEnv.builderCode.trim();
  if (!code) {
    return undefined;
  }
  return Attribution.toDataSuffix({
    codes: [code],
  });
}
