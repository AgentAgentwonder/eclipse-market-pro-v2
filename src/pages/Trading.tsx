import { useEffect } from 'react';
import { OrderForm } from '@/components/trading/OrderForm';
import { OrderBlotter } from '@/components/trading/OrderBlotter';
import { RiskBanner } from '@/components/trading/RiskBanner';
import { AppStatusBanner } from '@/components/AppStatusBanner';
import { useTradingStore } from '@/store/tradingStore';

export default function Trading() {
  // Trading selectors - primitive returns
  const isInitialized = useTradingStore(state => state.isInitialized);
  const initialize = useTradingStore(state => state.initialize);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trading</h1>
        <p className="text-muted-foreground mt-1">Execute trades and manage your positions</p>
      </div>

      <AppStatusBanner />

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