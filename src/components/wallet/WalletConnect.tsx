import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { NETWORKS, SUPPORTED_WALLETS } from '@/services/wallet/constants';
import { NetworkId, WalletKey } from '@/services/wallet/WalletService';

import { WalletList } from './WalletList';

export const WalletConnect = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId | ''>('')
  const [selectedWallet, setSelectedWallet] = useState<WalletKey | ''>('')
  const { connections, connect, disconnect } = useWallet()
  const { toast } = useToast()

  const handleConnect = async () => {
    if (!selectedNetwork || !selectedWallet) return

    try {
      await connect(selectedNetwork, selectedWallet, NETWORKS[selectedNetwork])
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${NETWORKS[selectedNetwork].name}`,
      })
      setSelectedNetwork('')
      setSelectedWallet('')
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description:
          error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <WalletList connections={connections} onDisconnect={disconnect} />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Network</label>
            <Select
              value={selectedNetwork}
              onValueChange={(value) => {
                setSelectedNetwork(value as NetworkId)
                setSelectedWallet('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose network" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NETWORKS)
                  .filter(([id]) => !connections.has(id as NetworkId))
                  .map(([id, network]) => (
                    <SelectItem key={id} value={id}>
                      <span className="flex items-center gap-2">
                        <span>{network.icon}</span>
                        <span>{network.name}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedNetwork && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Wallet</label>
              <Select
                value={selectedWallet}
                onValueChange={(value) => setSelectedWallet(value as WalletKey)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose wallet" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_WALLETS[selectedNetwork].map((wallet) => (
                    <SelectItem key={wallet} value={wallet}>
                      {wallet.charAt(0).toUpperCase() + wallet.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedNetwork && selectedWallet && (
            <Button className="w-full" onClick={handleConnect}>
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
