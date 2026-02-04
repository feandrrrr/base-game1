import fs from 'fs';
import path from 'path';

import 'dotenv/config';

import dotenv from 'dotenv';
import solc from 'solc';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('DEPLOYER_PRIVATE_KEY is required');
}

const sourcePath = path.join(process.cwd(), 'contracts', 'DailyTap.sol');
const source = fs.readFileSync(sourcePath, 'utf8');
const input = {
  language: 'Solidity',
  sources: {
    'DailyTap.sol': { content: source },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['DailyTap.sol'].DailyTap;
const abi = contract.abi;
const bytecode = `0x${contract.evm.bytecode.object}`;

const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const account = privateKeyToAccount(privateKey);

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpcUrl),
});

const publicClient = createPublicClient({
  chain: base,
  transport: http(rpcUrl),
});

const hash = await walletClient.deployContract({
  abi,
  bytecode,
});

const receipt = await publicClient.waitForTransactionReceipt({ hash });
console.log('Contract deployed at:', receipt.contractAddress);
