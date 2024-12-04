import { useAccount, useBalance } from 'wagmi'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BalanceDisplay = () => {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address,
    chainId: chain?.id,
  })

  if (!isConnected || !balance || !chain) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Wallet Balance on {chain.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-sm">Balance:</span>
          <span className="text-lg font-medium">
            {balance.formatted} {balance.symbol}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default BalanceDisplay
