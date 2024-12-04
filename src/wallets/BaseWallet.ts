import {
    BalanceData, INetwork, IWallet, IWalletConnectOptions, PsbtSignOptions, TransactionOptions
} from '../types';

export abstract class BaseWallet implements IWallet {
  abstract name: string
  abstract key: string

  abstract connect(
    network: string,
    options: IWalletConnectOptions
  ): Promise<{
    address: string
    networkInfo: INetwork
    compressedPublicKey: string | undefined
  }>

  abstract disconnect(): void

  abstract sendTransaction(
    toAddress: string,
    amount: number | bigint,
    options?: TransactionOptions,
    network?: string
  ): Promise<string>

  abstract getBalance(network?: string): Promise<number | BalanceData | string>

  abstract isInstalled(): boolean

  abstract signMessage(message: string, network?: string): Promise<string>

  abstract getCompressedPublicKey(network?: string): Promise<string>

  abstract signPsbt(
    psbt: string,
    network: string,
    options?: PsbtSignOptions
  ): Promise<string>
}
