# Base Tap Challenge (Mini App)

A simple Base mini app with two tap modes:

- Daily onchain tap (1 per day, recorded onchain)
- Rapid offchain tap (1 per second, recorded in DB)

Leaderboards are stored in a local SQLite database.

## Prerequisites

- Base app account
- A funded Base wallet for deployment (small amount of ETH for gas)
- [Vercel](https://vercel.com/) account for hosting the application

## Getting Started

### 1. Clone this repository

```bash
git clone https://github.com/base/demos.git
```

### 2. Install dependencies:

```bash
cd demos/minikit/waitlist-mini-app-qs
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_TAP_CONTRACT_ADDRESS=
NEXT_PUBLIC_PAYMASTER_URL=
BASE_RPC_URL=https://mainnet.base.org
DEPLOYER_PRIVATE_KEY=
```

> `DEPLOYER_PRIVATE_KEY` is only needed to deploy the tap contract.

### 4. Deploy the onchain tap contract

```bash
npm run deploy:tap
```

Copy the deployed address into `NEXT_PUBLIC_TAP_CONTRACT_ADDRESS`, then restart the dev server.

### 5. Configure Base Paymaster (gasless)

1. Go to the Coinbase Developer Platform Paymaster tool.
2. Create/select your project.
3. Enable the Paymaster and copy the **RPC URL**.
4. Allowlist your `DailyTap` contract and the `tap()` function.
5. Set per-user limits (e.g., 1 UserOperation per day).

Paste the RPC URL into `NEXT_PUBLIC_PAYMASTER_URL`.

### 6. Run locally:

```bash
npm run dev
```

## Local database

SQLite database is created at `data/leaderboard.db`.

## Deployment

### 1. Deploy to Vercel

```bash
vercel --prod
```

You should have a URL deployed to a domain similar to: `https://your-vercel-project-name.vercel.app/`

### 2. Update environment variables

Add your production URL and contract address:

```bash
NEXT_PUBLIC_URL=https://your-vercel-project-name.vercel.app/
NEXT_PUBLIC_TAP_CONTRACT_ADDRESS=0x...
BASE_RPC_URL=https://mainnet.base.org
```

### 3. Upload environment variables to Vercel

Add environment variables to your production environment:

```bash
vercel env add NEXT_PUBLIC_URL production
vercel env add NEXT_PUBLIC_TAP_CONTRACT_ADDRESS production
vercel env add BASE_RPC_URL production
```

## Account Association

### 1. Sign Your Manifest

1. Navigate to [Farcaster Manifest tool](https://farcaster.xyz/~/developers/mini-apps/manifest)
2. Paste your domain in the form field (ex: your-vercel-project-name.vercel.app)
3. Click the `Generate account association` button and follow the on-screen instructions for signing with your Farcaster wallet
4. Copy the `accountAssociation` object

### 2. Update Configuration

Update `farcaster.config.ts` to include the `accountAssociation` object:

```ts
export const farcasterConfig = {
    accountAssociation: {
        "header": "your-header-here",
        "payload": "your-payload-here",
        "signature": "your-signature-here"
    },
    miniapp: {
        // ... rest of your miniapp configuration
    },
}
```

### 3. Deploy Updates

```bash
vercel --prod
```

## Testing and Publishing

### 1. Preview Your App

Go to [base.dev/preview](https://base.dev/preview) to validate your app:

1. Add your app URL to view the embeds and click the launch button to verify the app launches as expected
2. Use the "Account association" tab to verify the association credentials were created correctly
3. Use the "Metadata" tab to see the metadata added from the manifest and identify any missing fields

### 2. Publish to Base App

To publish your app, create a post in the Base app with your app's URL.

## Learn More

For detailed step-by-step instructions, see the [Create a Mini App tutorial](https://docs.base.org/mini-apps/quickstart/create-new-miniapp).


---

## Disclaimer  

This project is a **demo application** created by the **Base / Coinbase Developer Relations team** for **educational and demonstration purposes only**.  

**There is no token, cryptocurrency, or investment product associated with Cubey, Base, or Coinbase.**  

Any social media pages, tokens, or applications claiming to be affiliated with, endorsed by, or officially connected to Cubey, Base, or Coinbase are **unauthorized and fraudulent**.  

We do **not** endorse or support any third-party tokens, apps, or projects using the Cubey name or branding.  

> [!WARNING]
> Do **not** purchase, trade, or interact with any tokens or applications claiming affiliation with Coinbase, Base, or Cubey.  
> Coinbase and Base will never issue a token or ask you to connect your wallet for this demo.  

For official Base developer resources, please visit:  
- [https://base.org](https://base.org)  
- [https://docs.base.org](https://docs.base.org)  

---
