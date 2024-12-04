import { Toaster } from '@/components/ui/toaster'

import BalanceDisplay from './components/wallet/BalanceDisplay'
import WalletConnector from './components/wallet/WalletConnector'
import WalletSign from './components/wallet/WalletSign'

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="py-6">
          <h1 className="flex justify-center text-2xl font-bold">
            Multi-Chain Wallet
          </h1>
        </header>

        <main>
          <WalletConnector />

          <WalletSign />

          <BalanceDisplay />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App
