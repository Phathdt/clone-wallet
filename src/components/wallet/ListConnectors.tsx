import { useConnect } from 'wagmi';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ListConnectors = () => {
  const { connectors } = useConnect()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Available Connectors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {connectors.map((connector) => (
            <div key={connector.uid} className="p-3 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{connector.name}</div>
                  <div className="text-sm text-gray-500">
                    ID: {connector.uid}
                  </div>
                </div>
                <div className="text-sm">
                  {connector.ready ? (
                    <span className="text-green-600">Ready</span>
                  ) : (
                    <span className="text-red-600">Not Ready</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {connectors.length === 0 && (
            <div className="text-center text-gray-500">
              No connectors available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ListConnectors
