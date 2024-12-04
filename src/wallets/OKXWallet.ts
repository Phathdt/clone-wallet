/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address, Chain, WalletClient } from 'viem';
import { base, mainnet } from 'viem/chains';
import { getPublicClient, getWalletClient } from 'wagmi/actions';

import { config } from '@/config/wagmi';

import {
    BalanceData, IWalletConnectOptions, NetworkType, PsbtSignOptions, TransactionOptions
} from '../types';
import { BaseWallet } from './BaseWallet';

export class OKXWallet extends BaseWallet {
  name = 'OKX'
  key = 'okx'

  private chainMap: Record<string, Chain> = {
    mainnet: mainnet,
    base: base,
  }

  async connect(network: string, options: IWalletConnectOptions) {
    if (options.network.type === NetworkType.BITCOIN) {
      return this.connectBitcoin(options)
    }
    return this.connectEVM(options)
  }

  private async connectBitcoin(options: IWalletConnectOptions) {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX Wallet Bitcoin provider not found')
    }

    try {
      const accounts = await window.okxwallet.bitcoin.connect()
      const publicKey = await window.okxwallet.bitcoin.getPublicKey()
      return {
        address: accounts[0],
        networkInfo: options.network,
        compressedPublicKey: publicKey,
      }
    } catch (error) {
      throw new Error(`Failed to connect OKX Bitcoin: ${error}`)
    }
  }

  private async connectEVM(options: IWalletConnectOptions) {
    const client = await getWalletClient(config, {
      chainId: parseInt(options.network.chainId),
    })
    if (!client) {
      throw new Error('Failed to get wallet client')
    }

    const [address] = await client.getAddresses()
    return {
      address,
      networkInfo: options.network,
      compressedPublicKey: undefined,
    }
  }

  async disconnect() {
    // OKX wallet doesn't have a specific disconnect method
    // The connection state is managed by wagmi for EVM
    return
  }

  async sendTransaction(
    toAddress: string,
    amount: number | bigint,
    options?: TransactionOptions,
    network?: string
  ): Promise<string> {
    const networkInfo = this.chainMap[network || 'mainnet']

    if (
      !networkInfo ||
      networkInfo.id === mainnet.id ||
      networkInfo.id === base.id
    ) {
      // EVM Transaction
      const client = await this.getEvmClient(network)
      const [account] = await client.getAddresses()
      const chain = this.getChain(network)

      if (!toAddress.startsWith('0x')) {
        throw new Error('Invalid EVM address format')
      }

      return client.sendTransaction({
        chain,
        account,
        to: toAddress as Address,
        value: BigInt(amount),
        gas: options?.gasLimit ? BigInt(options.gasLimit) : undefined,
        maxFeePerGas: options?.maxFeePerGas
          ? BigInt(options.maxFeePerGas)
          : undefined,
        maxPriorityFeePerGas: options?.maxPriorityFeePerGas
          ? BigInt(options.maxPriorityFeePerGas)
          : undefined,
        nonce: options?.nonce,
        data: options?.data ? (options.data as `0x${string}`) : undefined,
      })
    } else {
      // Bitcoin Transaction
      if (!window.okxwallet?.bitcoin) {
        throw new Error('OKX Wallet Bitcoin provider not found')
      }

      return window.okxwallet.bitcoin.sendTransaction({
        to: toAddress,
        amount: Number(amount),
        feeRate: options?.feeRate,
      })
    }
  }

  async getBalance(network?: string): Promise<number | BalanceData | string> {
    const networkInfo = this.chainMap[network || 'mainnet']

    if (
      !networkInfo ||
      networkInfo.id === mainnet.id ||
      networkInfo.id === base.id
    ) {
      // EVM Balance
      const client = await this.getEvmClient(network)
      const publicClient = getPublicClient(config)
      const [address] = await client.getAddresses()

      const balance = await publicClient.getBalance({
        address,
      })

      return balance.toString()
    } else {
      // Bitcoin Balance
      if (!window.okxwallet?.bitcoin) {
        throw new Error('OKX Wallet Bitcoin provider not found')
      }

      return window.okxwallet.bitcoin.getBalance()
    }
  }

  isInstalled(): boolean {
    return typeof window !== 'undefined' && 'okxwallet' in window
  }

  async signMessage(message: string, network?: string): Promise<string> {
    const networkInfo = this.chainMap[network || 'mainnet']

    if (
      !networkInfo ||
      networkInfo.id === mainnet.id ||
      networkInfo.id === base.id
    ) {
      // EVM Message Signing
      const client = await this.getEvmClient(network)
      const [address] = await client.getAddresses()

      return client.signMessage({
        account: address,
        message,
      })
    } else {
      // Bitcoin Message Signing
      if (!window.okxwallet?.bitcoin) {
        throw new Error('OKX Wallet Bitcoin provider not found')
      }

      return window.okxwallet.bitcoin.signMessage(message)
    }
  }

  async getCompressedPublicKey(network?: string): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX Wallet Bitcoin provider not found')
    }

    return window.okxwallet.bitcoin.getPublicKey()
  }

  async signPsbt(
    psbt: string,
    network: string,
    options?: PsbtSignOptions
  ): Promise<string> {
    if (!window.okxwallet?.bitcoin) {
      throw new Error('OKX Wallet Bitcoin provider not found')
    }

    return window.okxwallet.bitcoin.signPsbt(psbt, options)
  }

  private async getEvmClient(chainId?: string): Promise<WalletClient> {
    const client = await getWalletClient(config, {
      chainId: chainId ? parseInt(chainId) : mainnet.id,
    })

    if (!client) throw new Error('No wallet client')
    return client
  }

  private getChain(networkId?: string): Chain {
    if (!networkId) return mainnet
    const chain = this.chainMap[networkId]
    if (!chain) throw new Error(`Unsupported network: ${networkId}`)
    return chain
  }
}
