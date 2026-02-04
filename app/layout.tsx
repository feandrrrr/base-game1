import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { SafeArea } from "@/shared/ui/SafeArea";
import { farcasterConfig } from "../farcaster.config";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: farcasterConfig.miniapp.name,
    description: farcasterConfig.miniapp.description,
    other: {
      "fc:frame": JSON.stringify({
        version: farcasterConfig.miniapp.version,
        imageUrl: farcasterConfig.miniapp.heroImageUrl,
        button: {
          title: `Join the ${farcasterConfig.miniapp.name} Waitlist`,
          action: {
            name: `Launch ${farcasterConfig.miniapp.name}`,
            type: "launch_frame",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="6982a131bd202a51855da51b" />
      </head>
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <Providers>
          <SafeArea>{children}</SafeArea>
        </Providers>
      </body>
    </html>
  );
}
