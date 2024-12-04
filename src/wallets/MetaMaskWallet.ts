/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address, Chain, WalletClient } from 'viem';
import { base, mainnet } from 'viem/chains';
import { getPublicClient, getWalletClient } from 'wagmi/actions';

import { config } from '@/config/wagmi';

import { BalanceData, IWalletConnectOptions, PsbtSignOptions, TransactionOptions } from '../types';
import { BaseWallet } from './BaseWallet';

export class MetaMaskWallet extends BaseWallet {
  name = 'MetaMask'
  key = 'metamask'

  private chainMap: Record<string, Chain> = {
    mainnet: mainnet,
    base: base,
  }

  async connect(network: string, options: IWalletConnectOptions) {
    if (!this.isInstalled()) {
      throw new Error('MetaMask is not installed')
    }

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
    return
  }

  async sendTransaction(
    toAddress: string,
    amount: number | bigint,
    options?: TransactionOptions,
    network?: string
  ): Promise<string> {
    const client = await this.getClient(network)
    const [account] = await client.getAddresses()
    const chain = this.getChain(network)

    // Ensure address is in correct format
    if (!toAddress.startsWith('0x')) {
      throw new Error(
        'Invalid address format. Must be a hex string starting with 0x'
      )
    }

    const hash = await client.sendTransaction({
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

    return hash
  }

  async getBalance(network?: string): Promise<number | BalanceData | string> {
    const client = await this.getClient(network)
    const publicClient = getPublicClient(config)
    const [address] = await client.getAddresses()

    const balance = await publicClient.getBalance({
      address,
    })

    return balance.toString()
  }

  isInstalled(): boolean {
    return typeof window !== 'undefined' && 'ethereum' in window
  }

  async signMessage(message: string, network?: string): Promise<string> {
    const client = await this.getClient(network)
    const [address] = await client.getAddresses()

    const signature = await client.signMessage({
      account: address,
      message,
    })

    return signature
  }

  async getCompressedPublicKey(network?: string): Promise<string> {
    throw new Error('Compressed public key not supported for EVM wallets')
  }

  async signPsbt(
    psbt: string,
    network: string,
    options?: PsbtSignOptions
  ): Promise<string> {
    throw new Error('PSBT signing not supported for EVM wallets')
  }

  private async getClient(chainId?: string): Promise<WalletClient> {
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
