import { useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderForm } from '@/components/trading/OrderForm';
import { OrderBlotter } from '@/components/trading/OrderBlotter';
import { RiskBanner } from '@/components/trading/RiskBanner';
import { useTradingStore } from '@/store/tradingStore';
import { useShallow } from 'zustand/react/shallow';
import { AlertCircle } from 'lucide-react';

export default function Trading() {
  const tradingSelector = useCallback(
    (state: ReturnType<typeof useTradingStore.getState>) => ({
      isInitialized: state.isInitialized,
      initialize: state.initialize,
      error: state.error,
    }),
    []
  );
  const { isInitialized, initialize, error } = useTradingStore(tradingSelector, useShallow);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trading</h1>
        <p className="text-muted-foreground mt-1">Execute trades and manage your positions</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RiskBanner />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <OrderBlotter />
        </div>

        <div>
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
