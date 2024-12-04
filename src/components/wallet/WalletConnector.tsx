import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 8453, name: 'Base' },
] as const

const WalletConnector = () => {
  const { toast } = useToast()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
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
        setIsWalletModalOpen(false)
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

  const handleConnectorSelect = (connector: (typeof connectors)[0]) => {
    try {
      connect({ connector })
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
    <>
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
                <Button
                  onClick={() => disconnect()}
                  variant="outline"
                  size="sm"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsWalletModalOpen(true)}
                disabled={isConnecting || isSwitching}
                className="w-full"
              >
                Select Wallet
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select a Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => handleConnectorSelect(connector)}
                disabled={isConnecting}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <div className="flex items-center gap-3">{connector.name}</div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WalletConnector
