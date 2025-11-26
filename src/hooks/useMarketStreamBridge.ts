import { useEffect, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { marketDataStore, type PriceData, type NewCoin } from '../store/marketDataStore';
import { useUIStore } from '../store/uiStore';

interface PriceUpdateEvent {
  symbol: string;
  price?: number;
  change?: number;
  volume?: number;
  ts: number;
  snapshot?: boolean;
}

interface ChartPriceUpdateEvent {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  change_24h: number;
}

interface NewCoinDetectedEvent {
  address: string;
  symbol: string;
  name: string;
  logoUri?: string;
  createdAt: string;
  liquidity: number;
  mintAuthorityRevoked: boolean;
  freezeAuthorityRevoked: boolean;
  holderCount: number;
  topHolderPercent: number;
  creatorWallet: string;
  creatorReputationScore: number;
  safetyScore: number;
  isSpam: boolean;
  detectedAt: string;
}

interface StreamStatusChangeEvent {
  provider: string;
  state: string;
  last_message?: number;
}

/**
 * Bridge hook that connects Tauri market data event streams to the marketDataStore.
 * Registers listeners for price updates, new coin detections, and stream status changes.
 * Should be mounted once at app root level.
 */
export function useMarketStreamBridge() {
  const unlistenersRef = useRef<UnlistenFn[]>([]);
  const addToast = useUIStore(state => state.addToast);
  const throttleBufferRef = useRef<PriceData[]>([]);
  const throttleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const flushPriceBuffer = () => {
      if (throttleBufferRef.current.length > 0) {
        const updates = [...throttleBufferRef.current];
        throttleBufferRef.current = [];
        marketDataStore.getState().updatePrices(updates);
      }
      throttleTimerRef.current = null;
    };

    const schedulePriceUpdate = (priceData: PriceData) => {
      throttleBufferRef.current.push(priceData);

      if (throttleTimerRef.current === null) {
        throttleTimerRef.current = window.setTimeout(flushPriceBuffer, 100);
      }
    };

    const setupListeners = async () => {
      try {
        const unlistenPriceUpdate = await listen<PriceUpdateEvent>('price_update', event => {
          if (!mounted) return;

          const payload = event.payload;
          const priceData: PriceData = {
            symbol: payload.symbol,
            price: payload.price ?? 0,
            change24h: payload.change ?? 0,
            volume: payload.volume ?? 0,
            timestamp: payload.ts,
            snapshot: payload.snapshot,
          };

          schedulePriceUpdate(priceData);
        });

        const unlistenChartPriceUpdate = await listen<ChartPriceUpdateEvent>(
          'chart_price_update',
          event => {
            if (!mounted) return;

            const payload = event.payload;
            const priceData: PriceData = {
              symbol: payload.symbol,
              price: payload.price,
              change24h: payload.change_24h,
              volume: payload.volume,
              timestamp: payload.timestamp,
            };

            schedulePriceUpdate(priceData);
          }
        );

        const unlistenNewCoinDetected = await listen<NewCoinDetectedEvent>(
          'new-coin-detected',
          event => {
            if (!mounted) return;

            const payload = event.payload;
            const newCoin: NewCoin = {
              address: payload.address,
              symbol: payload.symbol,
              name: payload.name,
              logoUri: payload.logoUri,
              createdAt: payload.createdAt,
              liquidity: payload.liquidity,
              mintAuthorityRevoked: payload.mintAuthorityRevoked,
              freezeAuthorityRevoked: payload.freezeAuthorityRevoked,
              holderCount: payload.holderCount,
              topHolderPercent: payload.topHolderPercent,
              creatorWallet: payload.creatorWallet,
              creatorReputationScore: payload.creatorReputationScore,
              safetyScore: payload.safetyScore,
              isSpam: payload.isSpam,
              detectedAt: payload.detectedAt,
            };

            marketDataStore.getState().addNewCoin(newCoin);

            if (newCoin.safetyScore >= 70) {
              addToast({
                type: 'info',
                title: 'New Coin Detected',
                message: `${newCoin.symbol} - Safety Score: ${newCoin.safetyScore}`,
                duration: 5000,
              });
            }
          }
        );

        const unlistenStreamStatusChange = await listen<StreamStatusChangeEvent>(
          'stream_status_change',
          event => {
            if (!mounted) return;

            const payload = event.payload;
            marketDataStore.getState().setStreamStatus({
              provider: payload.provider,
              state: payload.state,
              lastMessage: payload.last_message,
            });

            const isConnected = payload.state === 'Connected' || payload.state === 'connected';
            marketDataStore.getState().setConnected(isConnected);

            if (payload.state === 'Failed' || payload.state === 'Disconnected') {
              addToast({
                type: 'warning',
                title: 'Market Stream Disconnected',
                message: `${payload.provider} stream is ${payload.state}`,
                duration: 8000,
              });
            } else if (isConnected) {
              addToast({
                type: 'success',
                title: 'Market Stream Connected',
                message: `${payload.provider} stream is active`,
                duration: 3000,
              });
            }
          }
        );

        unlistenersRef.current = [
          unlistenPriceUpdate,
          unlistenChartPriceUpdate,
          unlistenNewCoinDetected,
          unlistenStreamStatusChange,
        ];

        console.log('[MarketStreamBridge] Event listeners registered');
      } catch (error) {
        console.error('[MarketStreamBridge] Failed to setup event listeners:', error);
        if (mounted) {
          addToast({
            type: 'error',
            title: 'Market Stream Error',
            message: 'Failed to connect to market data events',
            duration: 8000,
          });
        }
      }
    };

    setupListeners();

    return () => {
      mounted = false;
      console.log('[MarketStreamBridge] Cleaning up event listeners');

      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
      flushPriceBuffer();

      unlistenersRef.current.forEach(unlisten => {
        unlisten();
      });
      unlistenersRef.current = [];
    };
  }, [addToast]);
}
