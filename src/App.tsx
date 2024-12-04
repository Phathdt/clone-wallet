import { Toaster } from '@/components/ui/toaster';
import { WalletConnect } from '@/components/wallet/WalletConnect';

function App() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="py-6">
          <h1 className="text-2xl font-bold">Multi-Chain Wallet</h1>
        </header>

        <main>
          <WalletConnect />
        </main>
      </div>
      <Toaster />
    </div>
  )
}

export default App
