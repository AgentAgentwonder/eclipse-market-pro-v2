'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { errorLogger } from '@/utils/errorLogger';

interface APIKeys {
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
}

interface APIContextType {
  apiKeys: APIKeys;
  setAPIKey: (key: keyof APIKeys, value: string | number | boolean | string[] | number[]) => void;
  loadAPIKeys: () => void;
  clearAPIKeys: () => void;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export function APIProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = useState<APIKeys>({
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
  });

  useEffect(() => {
    errorLogger.info('APIProvider: Loading API keys from localStorage', 'APIProvider');
    const stored = localStorage.getItem('eclipse_api_keys');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setApiKeys(parsed);
        errorLogger.info('APIProvider: API keys loaded successfully', 'APIProvider');
      } catch (error) {
        errorLogger.error(
          'Failed to parse stored API keys',
          'APIProvider',
          error instanceof Error ? error : undefined
        );
        console.error('Failed to load API keys:', error);
      }
    } else {
      errorLogger.info('APIProvider: No stored API keys found, using defaults', 'APIProvider');
    }
  }, []);

  const setAPIKey = (
    key: keyof APIKeys,
    value: string | number | boolean | string[] | number[]
  ) => {
    const updated = { ...apiKeys, [key]: value };
    setApiKeys(updated);
    localStorage.setItem('eclipse_api_keys', JSON.stringify(updated));
  };

  const loadAPIKeys = () => {
    const stored = localStorage.getItem('eclipse_api_keys');
    if (stored) {
      try {
        setApiKeys(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load API keys:', error);
      }
    }
  };

  const clearAPIKeys = () => {
    setApiKeys({
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
    });
    localStorage.removeItem('eclipse_api_keys');
  };

  return (
    <APIContext.Provider value={{ apiKeys, setAPIKey, loadAPIKeys, clearAPIKeys }}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPIKeys() {
  const context = useContext(APIContext);
  if (context === undefined) {
    errorLogger.error('useAPIKeys must be used within an APIProvider', 'useAPIKeys Hook');
    throw new Error('useAPIKeys must be used within an APIProvider');
  }
  return context;
}
