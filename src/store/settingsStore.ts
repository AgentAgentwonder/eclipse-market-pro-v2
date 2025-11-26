import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { createBoundStoreWithMiddleware } from './createBoundStore';
import { getPersistentStorage } from './storage';
import { errorLogger } from '@/utils/errorLogger';

export interface SettingsState {
  databaseUrl: string;
  sentrySdn: string;
  claudeApiKey: string;
  openaiApiKey: string;
  llmProvider: 'claude' | 'gpt4';
  twitterBearerToken: string;
  paperTradingEnabled: boolean;
  paperTradingBalance: number;
  selectedCrypto: string;
  buyInAmounts: number[];
  defaultBuyInAmount: number;
  minMarketCap: number;
  theme: 'eclipse' | 'midnight' | 'cyber' | 'lunar';
  phantomConnected: boolean;
  phantomAddress: string;
  updateSetting: <K extends keyof Omit<SettingsState, 'updateSetting' | 'togglePaperTrading' | 'addBuyInPreset' | 'removeBuyInPreset' | 'connectPhantom' | 'disconnectPhantom' | 'resetSettings'>>(
    key: K,
    value: SettingsState[K]
  ) => void;
  togglePaperTrading: () => void;
  addBuyInPreset: (amount: number) => void;
  removeBuyInPreset: (amount: number) => void;
  connectPhantom: (address: string) => void;
  disconnectPhantom: () => void;
  resetSettings: () => void;
}

const DEFAULTS: Omit<SettingsState, 'updateSetting' | 'togglePaperTrading' | 'addBuyInPreset' | 'removeBuyInPreset' | 'connectPhantom' | 'disconnectPhantom' | 'resetSettings'> = {
  databaseUrl: '',
  sentrySdn: '',
  claudeApiKey: '',
  openaiApiKey: '',
  llmProvider: 'claude',
  twitterBearerToken: '',
  paperTradingEnabled: false,
  paperTradingBalance: 10000,
  selectedCrypto: 'SOL',
  buyInAmounts: [10, 25, 50, 100],
  defaultBuyInAmount: 50,
  minMarketCap: 25000000,
  theme: 'eclipse',
  phantomConnected: false,
  phantomAddress: '',
};

const storeResult = createBoundStoreWithMiddleware<SettingsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...DEFAULTS,
        updateSetting: (key, value) => {
          set({ [key]: value });
          errorLogger.info(`Settings: Updated ${key}`, 'settingsStore');
        },
        togglePaperTrading: () =>
          set(state => {
            const newValue = !state.paperTradingEnabled;
            errorLogger.info(
              `Settings: Paper trading ${newValue ? 'enabled' : 'disabled'}`,
              'settingsStore'
            );
            return { paperTradingEnabled: newValue };
          }),
        addBuyInPreset: amount => {
          const current = get().buyInAmounts;
          if (current.includes(amount)) {
            errorLogger.info(
              `Settings: Buy-in preset $${amount} already exists`,
              'settingsStore'
            );
            return;
          }
          const updated = [...current, amount].sort((a, b) => a - b);
          set({ buyInAmounts: updated });
          errorLogger.info(`Settings: Added buy-in preset $${amount}`, 'settingsStore');
        },
        removeBuyInPreset: amount => {
          const state = get();
          const updated = state.buyInAmounts.filter(a => a !== amount);
          const updates: Partial<SettingsState> = { buyInAmounts: updated };
          if (state.defaultBuyInAmount === amount && updated.length > 0) {
            updates.defaultBuyInAmount = updated[0];
            errorLogger.info(
              `Settings: Removed buy-in preset $${amount} and reset default to $${updated[0]}`,
              'settingsStore'
            );
          } else {
            errorLogger.info(`Settings: Removed buy-in preset $${amount}`, 'settingsStore');
          }
          set(updates);
        },
        connectPhantom: address => {
          set({ phantomConnected: true, phantomAddress: address });
          errorLogger.info(`Settings: Connected Phantom wallet ${address}`, 'settingsStore');
        },
        disconnectPhantom: () => {
          set({ phantomConnected: false, phantomAddress: '' });
          errorLogger.info('Settings: Disconnected Phantom wallet', 'settingsStore');
        },
        resetSettings: () => {
          set(DEFAULTS);
          errorLogger.info('Settings: Reset all settings to defaults', 'settingsStore');
        },
      }),
      {
        name: 'eclipse-settings-store',
        storage: createJSONStorage(getPersistentStorage),
        version: 1,
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            errorLogger.info('Settings: Migrating from old localStorage format', 'settingsStore');
            const oldData = getPersistentStorage().getItem('eclipse_api_keys');
            if (oldData) {
              try {
                const parsed = JSON.parse(oldData);
                return { ...DEFAULTS, ...parsed, phantomConnected: false, phantomAddress: '' };
              } catch (error) {
                errorLogger.error(
                  'Settings: Failed to migrate old data',
                  'settingsStore',
                  error instanceof Error ? error : undefined
                );
              }
            }
          }
          return persistedState as SettingsState;
        },
      }
    )
  )
);

export const useSettingsStore = storeResult.useStore;
export const settingsStore = storeResult.store;

export const usePaperTrading = () => {
  return useSettingsStore(state => ({
    enabled: state.paperTradingEnabled,
    balance: state.paperTradingBalance,
  }));
};

export const useQuickBuys = () => {
  return useSettingsStore(state => ({
    amounts: state.buyInAmounts,
    defaultAmount: state.defaultBuyInAmount,
  }));
};

export const useSelectedCrypto = () => {
  return useSettingsStore(state => state.selectedCrypto);
};

export const useMinMarketCap = () => {
  return useSettingsStore(state => state.minMarketCap);
};

export const useLLMProvider = () => {
  return useSettingsStore(state => ({
    provider: state.llmProvider,
    claudeKey: state.claudeApiKey,
    openaiKey: state.openaiApiKey,
  }));
};

export const usePhantomWallet = () => {
  return useSettingsStore(state => ({
    connected: state.phantomConnected,
    address: state.phantomAddress,
  }));
};
