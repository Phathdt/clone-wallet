import { INetwork } from './network';

export interface TransactionOptions {
  feeRate?: number
  gasLimit?: number | bigint
  maxFeePerGas?: number | string
  maxPriorityFeePerGas?: number | string
  nonce?: number
  data?: string
}

export interface BalanceData {
  confirmed: number | string
  unconfirmed: number | string
  total: number | string
}

export interface IWalletConnectOptions {
  path?: string
  network: INetwork
}

export interface PsbtInputToSign {
  index: number
  address?: string
  publicKey?: string
  sighashTypes?: number[]
  disableTweakSigner?: boolean
}

export interface PsbtSignOptions {
  autoFinalized: boolean
  toSignInputs: PsbtInputToSign[]
}

export interface IWallet {
  name: string
  key: string
  connect: (
    network: string,
    options: IWalletConnectOptions
  ) => Promise<{
    address: string
    networkInfo: INetwork
    compressedPublicKey: string | undefined
  }>
  disconnect: () => void
  sendTransaction: (
    toAddress: string,
    amount: number | bigint,
    options?: TransactionOptions,
    network?: string
  ) => Promise<string>
  getBalance: (network?: string) => Promise<number | BalanceData | string>
  isInstalled: () => boolean
  signMessage: (message: string, network?: string) => Promise<string>
  signPsbt: (
    psbt: string,
    network: string,
    options?: PsbtSignOptions
  ) => Promise<string>
  getCompressedPublicKey: (network?: string) => Promise<string>
}
