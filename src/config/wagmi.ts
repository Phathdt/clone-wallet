import { base, mainnet } from 'viem/chains'
import { createConfig, http } from 'wagmi'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  okxWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, okxWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Multi Chain Wallet',
    projectId: projectId,
  }
)

export const config = createConfig({
  connectors,
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
