import { createBoundStore } from './createBoundStore';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  timestamp: number;
  snapshot?: boolean;
}

export interface NewCoin {
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

export interface StreamStatus {
  provider: string;
  state: string;
  lastMessage?: number;
}

interface MarketDataStoreState {
  prices: Map<string, PriceData>;
  newCoins: NewCoin[];
  streamStatus: StreamStatus | null;
  isConnected: boolean;
  subscribedSymbols: Set<string>;

  updatePrice: (priceData: PriceData) => void;
  updatePrices: (priceDataArray: PriceData[]) => void;
  addNewCoin: (coin: NewCoin) => void;
  addNewCoins: (coins: NewCoin[]) => void;
  setStreamStatus: (status: StreamStatus) => void;
  setConnected: (connected: boolean) => void;
  subscribeSymbol: (symbol: string) => void;
  unsubscribeSymbol: (symbol: string) => void;
  clearNewCoins: () => void;
  reset: () => void;
}

const initialState = {
  prices: new Map<string, PriceData>(),
  newCoins: [],
  streamStatus: null,
  isConnected: false,
  subscribedSymbols: new Set<string>(),
};

const storeResult = createBoundStore<MarketDataStoreState>((set, get) => ({
  ...initialState,

  updatePrice: (priceData: PriceData) => {
    set(state => {
      const newPrices = new Map(state.prices);
      const existing = newPrices.get(priceData.symbol);

      if (!existing || priceData.timestamp >= existing.timestamp) {
        const merged: PriceData = {
          symbol: priceData.symbol,
          price: priceData.price ?? existing?.price ?? 0,
          change24h: priceData.change24h ?? existing?.change24h ?? 0,
          volume: priceData.volume ?? existing?.volume ?? 0,
          timestamp: priceData.timestamp,
          snapshot: priceData.snapshot,
        };
        newPrices.set(priceData.symbol, merged);
      }

      return { prices: newPrices };
    });
  },

  updatePrices: (priceDataArray: PriceData[]) => {
    set(state => {
      const newPrices = new Map(state.prices);

      for (const priceData of priceDataArray) {
        const existing = newPrices.get(priceData.symbol);

        if (!existing || priceData.timestamp >= existing.timestamp) {
          const merged: PriceData = {
            symbol: priceData.symbol,
            price: priceData.price ?? existing?.price ?? 0,
            change24h: priceData.change24h ?? existing?.change24h ?? 0,
            volume: priceData.volume ?? existing?.volume ?? 0,
            timestamp: priceData.timestamp,
            snapshot: priceData.snapshot,
          };
          newPrices.set(priceData.symbol, merged);
        }
      }

      return { prices: newPrices };
    });
  },

  addNewCoin: (coin: NewCoin) => {
    set(state => {
      const exists = state.newCoins.some(c => c.address === coin.address);
      if (exists) return state;

      const newCoins = [coin, ...state.newCoins].slice(0, 100);
      return { newCoins };
    });
  },

  addNewCoins: (coins: NewCoin[]) => {
    set(state => {
      const existingAddresses = new Set(state.newCoins.map(c => c.address));
      const uniqueNewCoins = coins.filter(c => !existingAddresses.has(c.address));

      if (uniqueNewCoins.length === 0) return state;

      const newCoins = [...uniqueNewCoins, ...state.newCoins].slice(0, 100);
      return { newCoins };
    });
  },

  setStreamStatus: (status: StreamStatus) => {
    set({ streamStatus: status });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },

  subscribeSymbol: (symbol: string) => {
    set(state => {
      const newSubscribed = new Set(state.subscribedSymbols);
      newSubscribed.add(symbol);
      return { subscribedSymbols: newSubscribed };
    });
  },

  unsubscribeSymbol: (symbol: string) => {
    set(state => {
      const newSubscribed = new Set(state.subscribedSymbols);
      newSubscribed.delete(symbol);
      return { subscribedSymbols: newSubscribed };
    });
  },

  clearNewCoins: () => {
    set({ newCoins: [] });
  },

  reset: () => {
    set(initialState);
  },
}));

export const useMarketDataStore = storeResult.useStore;
export const marketDataStore = storeResult.store;

export const usePrice = (symbol: string): PriceData | undefined => {
  return useMarketDataStore(state => state.prices.get(symbol));
};

export const useNewCoins = (filter?: {
  minSafetyScore?: number;
  maxAge?: number;
  minLiquidity?: number;
}): NewCoin[] => {
  return useMarketDataStore(state => {
    let filtered = state.newCoins.filter(c => !c.isSpam);

    if (filter?.minSafetyScore !== undefined) {
      filtered = filtered.filter(c => c.safetyScore >= filter.minSafetyScore);
    }

    if (filter?.minLiquidity !== undefined) {
      filtered = filtered.filter(c => c.liquidity >= filter.minLiquidity);
    }

    if (filter?.maxAge !== undefined) {
      const now = Date.now();
      filtered = filtered.filter(c => {
        const detectedTime = new Date(c.detectedAt).getTime();
        const ageMs = now - detectedTime;
        const ageHours = ageMs / (1000 * 60 * 60);
        return ageHours <= filter.maxAge;
      });
    }

    return filtered;
  });
};

export const useStreamConnected = (): boolean => {
  return useMarketDataStore(state => state.isConnected);
};

export const usePriceMap = (): Map<string, PriceData> => {
  return useMarketDataStore(state => state.prices);
};
