/* eslint-disable @typescript-eslint/no-explicit-any */
import { PsbtSignOptions } from './wallet';

export {}

declare global {
  interface EthereumProvider {
    isMetaMask?: boolean
    request: (params: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, callback: (params?: any) => void) => void
    removeListener: (event: string, callback: (params?: any) => void) => void
    selectedAddress: string | null
    networkVersion: string
    chainId: string
    isConnected: () => boolean
  }

  interface Window {
    okxwallet?: {
      bitcoin?: {
        connect(): Promise<string[]>
        signMessage(message: string): Promise<string>
        signPsbt(psbt: string, options?: PsbtSignOptions): Promise<string>
        getPublicKey(): Promise<string>
        getBalance(): Promise<{
          confirmed: number
          unconfirmed: number
          total: number
        }>
        sendTransaction(params: {
          to: string
          amount: number
          feeRate?: number
        }): Promise<string>
      }
      ethereum?: EthereumProvider
    }
  }
}
