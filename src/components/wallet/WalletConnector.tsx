import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 8453, name: 'Base' },
] as const

const WalletConnector = () => {
  const { toast } = useToast()
  const { isConnected, address } = useAccount()
  const {
    connect,
    connectors,
    isPending: isConnecting,
  } = useConnect({
    mutation: {
      onSuccess() {
        toast({
          title: 'Connected',
          description: 'Wallet connected successfully',
        })
      },
      onError(error) {
        toast({
          variant: 'destructive',
          title: 'Error connecting wallet',
          description: error.message,
        })
      },
    },
  })

  const { disconnect } = useDisconnect({
    mutation: {
      onSuccess() {
        toast({
          title: 'Disconnected',
          description: 'Wallet disconnected successfully',
        })
      },
    },
  })

  const { switchChain, isPending: isSwitching } = useSwitchChain({
    mutation: {
      onSuccess(data) {
        toast({
          title: 'Network Changed',
          description: `Switched to ${
            data?.name || 'new network'
          } successfully`,
        })
      },
      onError(error) {
        toast({
          variant: 'destructive',
          title: 'Error switching network',
          description: error.message,
        })
      },
    },
  })

  const handleConnect = async () => {
    try {
      // Tìm WalletConnect connector trước
      let connector = connectors.find((c) => c.name === 'WalletConnect')

      // Nếu không có WalletConnect, thử tìm MetaMask
      if (!connector) {
        connector = connectors.find((c) => c.name === 'MetaMask')
      }

      if (connector) {
        connect({ connector })
      } else {
        toast({
          variant: 'destructive',
          title: 'Connection Error',
          description: 'No compatible wallet connector found',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description:
          error instanceof Error ? error.message : 'Failed to connect wallet',
      })
    }
  }

  const handleNetworkChange = (chainId: string) => {
    switchChain({ chainId: Number(chainId) })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Network Selection</CardTitle>
        <CardDescription>Select network and connect wallet</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">Select Network:</div>
          <Select onValueChange={handleNetworkChange} disabled={isSwitching}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CHAINS.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center">
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button onClick={() => disconnect()} variant="outline" size="sm">
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting || isSwitching}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletConnector
