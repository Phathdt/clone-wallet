import { Toaster } from '@/components/ui/toaster';
import WalletConnector from '@/components/wallet/WalletConnector';

import WalletSign from './components/wallet/WalletSign';

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="py-6">
          <h1 className="text-2xl font-bold">Multi-Chain Wallet</h1>
        </header>

        <main>
          <WalletConnector />

          <WalletSign />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App
