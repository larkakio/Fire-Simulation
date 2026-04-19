import { base, mainnet } from "wagmi/chains";
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import {
  baseAccount,
  injected,
  walletConnect,
} from "@wagmi/connectors";
import { publicEnv } from "@/lib/env";

const wcId = publicEnv.walletConnectProjectId;

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({
      appName: "Fire Simulation",
    }),
    ...(wcId
      ? [
          walletConnect({
            projectId: wcId,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
