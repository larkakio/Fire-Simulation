const DEFAULT_SITE = "https://fire-simulation-xi.vercel.app";
const DEFAULT_BASE_APP_ID = "69e48acc86272d70f28d742f";
const DEFAULT_BUILDER_CODE = "bc_lxad4t4c";

export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 8453),
  checkInContract: process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined,
  baseAppId: process.env.NEXT_PUBLIC_BASE_APP_ID ?? DEFAULT_BASE_APP_ID,
  builderCode: process.env.NEXT_PUBLIC_BUILDER_CODE ?? DEFAULT_BUILDER_CODE,
  builderCodeSuffix: process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
    | `0x${string}`
    | undefined,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
} as const;
