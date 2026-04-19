export const publicEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 8453),
  checkInContract: process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS as
    | `0x${string}`
    | undefined,
  baseAppId: process.env.NEXT_PUBLIC_BASE_APP_ID ?? "fire-simulation-app",
  builderCode: process.env.NEXT_PUBLIC_BUILDER_CODE ?? "",
  builderCodeSuffix: process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as
    | `0x${string}`
    | undefined,
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
} as const;
