"use client";

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { baseAccount } from "wagmi/connectors";

import { farcasterConfig } from "@/farcaster.config";

export const wagmiConfig = createConfig({
  chains: [base],
  transports: { [base.id]: http() },
  connectors: [
    farcasterMiniApp(),
    baseAccount({
      appName: farcasterConfig.miniapp.name,
      appLogoUrl: farcasterConfig.miniapp.iconUrl,
    }),
  ],
});
