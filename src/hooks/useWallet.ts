import { useCallback, useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { walletService } from '@/services/wallet/constants';
import { NetworkId, WalletKey } from '@/services/wallet/WalletService';
import { INetwork, NetworkType } from '@/types';

interface WalletConnection {
  address: string
  network: INetwork
  walletKey: string
}

// Map wallet keys to RainbowKit connector IDs
const WALLET_TO_CONNECTOR: Record<WalletKey, string> = {
  metamask: 'metaMask',
  okx: 'okx',
}

export const useWallet = () => {
  const [connections, setConnections] = useState<Map<string, WalletConnection>>(
    new Map()
  )
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const {
    address: evmAddress,
    isConnected: isEvmConnected,
    chainId,
  } = useAccount()
  const { disconnectAsync: disconnectEvm } = useDisconnect()
  const { connectAsync: connectEvm, connectors } = useConnect()

  // Sync EVM connections with local state
  useEffect(() => {
    if (isEvmConnected && evmAddress && chainId) {
      const networkId =
        chainId === 1 ? 'mainnet' : chainId === 8453 ? 'base' : null
      if (networkId) {
        setConnections((prev) =>
          new Map(prev).set(networkId, {
            address: evmAddress,
            network: {
              id: networkId,
              name: networkId === 'mainnet' ? 'Ethereum' : 'Base',
              icon: networkId === 'mainnet' ? 'Ξ' : 'Ⓑ',
              type: NetworkType.EVM,
              chainId: chainId.toString(),
            },
            walletKey: getActiveConnector()?.id || 'unknown',
          })
        )
      }
    }
  }, [isEvmConnected, evmAddress, chainId])

  const getActiveConnector = useCallback(() => {
    return connectors.find(
      (c) => c.uid === localStorage.getItem('wallet.selected')
    )
  }, [connectors])

  const getConnectorByWallet = useCallback(
    (walletKey: WalletKey) => {
      const connectorId = WALLET_TO_CONNECTOR[walletKey]
      return connectors.find((c) => c.id === connectorId)
    },
    [connectors]
  )

  const connect = useCallback(
    async (networkId: string, walletKey: string, networkInfo: INetwork) => {
      try {
        setError(null)
        setIsConnecting(true)

        if (networkInfo.type === NetworkType.EVM) {
          const connector = getConnectorByWallet(walletKey as WalletKey)
          if (!connector) {
            throw new Error(`No connector found for wallet ${walletKey}`)
          }

          const currentConnector = getActiveConnector()
          const isAlreadyConnectedWithSameWallet =
            isEvmConnected && currentConnector?.id === connector.id

          if (isAlreadyConnectedWithSameWallet) {
            // Ensure connector has switchChain method
            if (typeof connector.switchChain !== 'function') {
              throw new Error('Wallet does not support switching chains')
            }

            try {
              const chainId = parseInt(networkInfo.chainId)
              await connector.switchChain({ chainId })

              // Update local state after successful chain switch
              if (evmAddress) {
                setConnections((prev) =>
                  new Map(prev).set(networkId, {
                    address: evmAddress,
                    network: networkInfo,
                    walletKey,
                  })
                )
              }
              return
            } catch (switchError) {
              throw new Error(`Failed to switch chain: ${switchError}`)
            }
          }

          // If not connected or different wallet, connect normally
          await connectEvm({
            connector,
            chainId: parseInt(networkInfo.chainId),
          })

          localStorage.setItem('wallet.selected', connector.uid)
        } else {
          // Handle non-EVM connection through wallet service
          const result = await walletService.connect(
            networkId as NetworkId,
            walletKey as WalletKey,
            networkInfo
          )

          setConnections((prev) =>
            new Map(prev).set(networkId, {
              address: result.address,
              network: networkInfo,
              walletKey,
            })
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to connect wallet'
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsConnecting(false)
      }
    },
    [connectEvm, getConnectorByWallet, isEvmConnected, evmAddress]
  )

  const disconnect = useCallback(
    async (networkId: string) => {
      try {
        const connection = connections.get(networkId)
        if (!connection) return

        if (connection.network.type === NetworkType.EVM) {
          await disconnectEvm()
          localStorage.removeItem('wallet.selected')
        } else {
          await walletService.disconnect(networkId as NetworkId)
        }

        setConnections((prev) => {
          const newConnections = new Map(prev)
          newConnections.delete(networkId)
          return newConnections
        })
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to disconnect wallet'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [disconnectEvm, connections]
  )

  const getConnection = useCallback(
    (networkId: string): WalletConnection | undefined => {
      return connections.get(networkId)
    },
    [connections]
  )

  const isWalletConnected = useCallback(
    (networkId: string): boolean => {
      return connections.has(networkId)
    },
    [connections]
  )

  return {
    connections,
    error,
    isConnecting,
    connect,
    disconnect,
    evmAddress,
    isEvmConnected,
    getConnection,
    isWalletConnected,
  }
}
