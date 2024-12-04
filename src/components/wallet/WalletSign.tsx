import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const WalletSign = () => {
  const { address, isConnected } = useAccount()
  const { signMessage, isPending: isSignPending } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        setSignature(data)
      },
      onError: (error) => {
        setError(error.message)
      },
    },
  })

  const [signature, setSignature] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleSign = () => {
    setError('')
    signMessage({ message: 'Hello! This is a message to verify your wallet.' })
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Please connect your wallet first
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Message</CardTitle>
        <CardDescription>
          Sign a message with your connected wallet
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-center">
          <div>
            Connected Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
        </div>

        <Button
          onClick={handleSign}
          disabled={isSignPending}
          className="w-full"
        >
          {isSignPending ? 'Signing...' : 'Sign Message'}
        </Button>

        {signature && (
          <Alert>
            <AlertDescription className="break-all text-xs">
              Signature: {signature}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default WalletSign
