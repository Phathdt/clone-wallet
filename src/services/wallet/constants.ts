import { INetwork, IWallet, NetworkType } from '@/types';
import { MetaMaskWallet, OKXWallet } from '@/wallets';

import { NetworkId, WalletConnection, WalletKey } from './WalletService';

export const NETWORKS: Record<NetworkId, INetwork> = {
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    icon: '₿',
    type: NetworkType.BITCOIN,
    chainId: '0',
  },
  base: {
    id: 'base',
    name: 'Base',
    icon: 'Ⓑ',
    type: NetworkType.EVM,
    chainId: '8453',
  },
  mainnet: {
    id: 'mainnet',
    name: 'Ethereum',
    icon: 'Ξ',
    type: NetworkType.EVM,
    chainId: '1',
  },
}

export const SUPPORTED_WALLETS: Record<NetworkId, WalletKey[]> = {
  bitcoin: ['okx'],
  base: ['okx', 'metamask'],
  mainnet: ['okx', 'metamask'],
}

export class WalletService {
  private static instance: WalletService
  private walletMap: Map<WalletKey, IWallet>
  private networkConnections: Map<NetworkId, WalletConnection>

  private constructor() {
    this.walletMap = new Map()
    this.networkConnections = new Map()
    this.initializeWallets()
  }

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  private initializeWallets() {
    this.walletMap.set('okx', new OKXWallet())
    this.walletMap.set('metamask', new MetaMaskWallet())
  }

  public async connect(
    networkId: NetworkId,
    walletKey: WalletKey,
    networkInfo: INetwork
  ) {
    const wallet = this.walletMap.get(walletKey)
    if (!wallet) {
      throw new Error(`Wallet ${walletKey} not found`)
    }

    const connection = await wallet.connect(networkId, {
      network: networkInfo,
    })
    this.networkConnections.set(networkId, {
      wallet,
      ...connection,
    })
    return connection
  }

  public async disconnect(networkId: NetworkId) {
    const connection = this.networkConnections.get(networkId)
    if (connection) {
      await connection.wallet.disconnect()
      this.networkConnections.delete(networkId)
    }
  }

  public getConnection(networkId: NetworkId): WalletConnection | undefined {
    return this.networkConnections.get(networkId)
  }

  public getAllConnections(): Map<NetworkId, WalletConnection> {
    return new Map(this.networkConnections)
  }

  public async executeWalletOperation(
    networkId: NetworkId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operation: (wallet: IWallet) => Promise<any>
  ) {
    const connection = this.networkConnections.get(networkId)
    if (!connection) {
      throw new Error(`No connected wallet found for network ${networkId}`)
    }
    return operation(connection.wallet)
  }
}

export const walletService = WalletService.getInstance()
