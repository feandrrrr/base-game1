const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const farcasterConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Base Tap Challenge",
    subtitle: "Daily onchain taps for real rewards",
    description: "Tap the USDC coin daily or sprint every second to climb the leaderboard.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#060b16",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "game",
    tags: ["tap", "leaderboard", "usdc", "base", "miniapp"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`, 
    tagline: "No candy tokens — only real dollars.",
    ogTitle: "Base Tap Challenge",
    ogDescription: "Daily onchain taps and rapid sprints with real USDC rewards.",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`,
  },
} as const;

