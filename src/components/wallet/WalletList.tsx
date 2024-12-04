import { Button } from '@/components/ui/button';
import { shortenAddress } from '@/lib/utils';
import { NETWORKS } from '@/services/wallet/constants';
import { NetworkId } from '@/services/wallet/WalletService';

interface WalletListProps {
  connections: Map<string, { address: string; walletKey: string }>
  onDisconnect: (networkId: NetworkId) => Promise<void>
}

export const WalletList = ({ connections, onDisconnect }: WalletListProps) => {
  if (connections.size === 0) return null
  console.log('🚀 ~ WalletList ~ connections:', connections)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Connected Wallets</h3>
      {Array.from(connections).map(([networkId, connection]) => (
        <div
          key={networkId}
          className="flex items-center justify-between p-3 bg-secondary rounded-lg"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span>{NETWORKS[networkId as NetworkId].icon}</span>
              <span className="font-medium">
                {NETWORKS[networkId as NetworkId].name}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {shortenAddress(connection.address)}
            </div>
            <div className="text-xs text-muted-foreground">
              via {connection.walletKey}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDisconnect(networkId as NetworkId)}
          >
            Disconnect
          </Button>
        </div>
      ))}
    </div>
  )
}
