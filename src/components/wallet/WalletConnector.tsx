import { useState } from 'react'
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { WalletButton } from '@rainbow-me/rainbowkit'

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 84532, name: 'Base Sepolia' },
  { id: 8453, name: 'Base' },
] as const

const SUPPORTED_WALLETS = [
  { id: 'okx', name: 'OKX Wallet' },
  { id: 'metaMask', name: 'MetaMask' },
  { id: 'phantom', name: 'Phantom' },
] as const

const WalletConnector = () => {
  const { toast } = useToast()
  const [selectedWallet, setSelectedWallet] = useState<string>()
  const { isConnected, address } = useAccount()

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

        {!isConnected && (
          <div className="space-y-2">
            <div className="text-sm">Select Wallet:</div>
            <Select onValueChange={setSelectedWallet}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_WALLETS.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
            selectedWallet && (
              <div className="w-full">
                <WalletButton.Custom wallet={selectedWallet}>
                  {({ ready, connect }) => (
                    <Button
                      type="button"
                      disabled={!ready}
                      onClick={connect}
                      className="w-full"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </WalletButton.Custom>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default WalletConnector
