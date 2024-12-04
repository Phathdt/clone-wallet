import { INetwork, IWallet } from '@/types';

export type WalletKey = 'okx' | 'metamask'
export type NetworkId = 'bitcoin' | 'base' | 'mainnet'

export interface WalletConnection {
  wallet: IWallet
  address: string
  networkInfo: INetwork
  compressedPublicKey?: string
}
