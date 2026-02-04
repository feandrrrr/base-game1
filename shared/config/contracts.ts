export const TAP_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_TAP_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  '0x0000000000000000000000000000000000000000';

export const TAP_CONTRACT_ABI = [
  {
    type: 'function',
    name: 'tap',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'DailyTapped',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'day', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const;
