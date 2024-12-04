export enum NetworkType {
  EVM = 'evm',
  BITCOIN = 'bitcoin',
  SOLANA = 'solana', // for future
}

export interface INetwork {
  id: string
  name: string
  icon: string
  type: NetworkType
  chainId: string
  rpcUrl?: string
}
