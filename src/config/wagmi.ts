import { http } from 'viem';
import { base, mainnet } from 'viem/chains';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

export const config = getDefaultConfig({
  appName: 'Multi Chain Wallet',
  projectId,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
