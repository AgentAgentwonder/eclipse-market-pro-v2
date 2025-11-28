import { createBoundStore } from './createBoundStore';

export type AppDomain = 'wallet' | 'trading' | 'portfolio' | 'ai' | 'market';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface DomainError {
  domain: AppDomain;
  message: string;
  timestamp: string;
  details?: unknown;
}

export interface DomainStatus {
  domain: AppDomain;
  connectionState: ConnectionState;
  lastUpdated: string;
  provider?: string;
  errorMessage?: string;
}

interface AppStatusStoreState {
  errors: Map<AppDomain, DomainError>;
  statuses: Map<AppDomain, DomainStatus>;

  reportError: (domain: AppDomain, message: string, details?: unknown) => void;
  clearError: (domain: AppDomain) => void;
  clearAllErrors: () => void;
  reportConnectionStatus: (
    domain: AppDomain,
    connectionState: ConnectionState,
    provider?: string,
    errorMessage?: string
  ) => void;
  getDomainError: (domain: AppDomain) => DomainError | undefined;
  getDomainStatus: (domain: AppDomain) => DomainStatus | undefined;
  hasErrors: () => boolean;
  reset: () => void;
}

const initialState = {
  errors: new Map<AppDomain, DomainError>(),
  statuses: new Map<AppDomain, DomainStatus>(),
};

const storeResult = createBoundStore<AppStatusStoreState>((set, get) => ({
  ...initialState,

  reportError: (domain: AppDomain, message: string, details?: unknown) => {
    const error: DomainError = {
      domain,
      message,
      timestamp: new Date().toISOString(),
      details,
    };

    set(state => {
      const newErrors = new Map(state.errors);
      newErrors.set(domain, error);
      return { errors: newErrors };
    });
  },

  clearError: (domain: AppDomain) => {
    set(state => {
      const newErrors = new Map(state.errors);
      newErrors.delete(domain);
      return { errors: newErrors };
    });
  },

  clearAllErrors: () => {
    set({ errors: new Map() });
  },

  reportConnectionStatus: (
    domain: AppDomain,
    connectionState: ConnectionState,
    provider?: string,
    errorMessage?: string
  ) => {
    const status: DomainStatus = {
      domain,
      connectionState,
      lastUpdated: new Date().toISOString(),
      provider,
      errorMessage,
    };

    set(state => {
      const newStatuses = new Map(state.statuses);
      newStatuses.set(domain, status);
      return { statuses: newStatuses };
    });

    if (connectionState === 'connected') {
      get().clearError(domain);
    } else if (connectionState === 'error' && errorMessage) {
      get().reportError(domain, errorMessage);
    }
  },

  getDomainError: (domain: AppDomain) => {
    return get().errors.get(domain);
  },

  getDomainStatus: (domain: AppDomain) => {
    return get().statuses.get(domain);
  },

  hasErrors: () => {
    return get().errors.size > 0;
  },

  reset: () => {
    set(initialState);
  },
}));

export const useAppStatusStore = storeResult.useStore;
export const appStatusStore = storeResult.store;

export const useAppErrors = (): DomainError[] => {
  return useAppStatusStore(state => Array.from(state.errors.values()));
};

export const useDomainError = (domain: AppDomain): DomainError | undefined => {
  return useAppStatusStore(state => state.errors.get(domain));
};

export const useDomainStatus = (domain: AppDomain): DomainStatus | undefined => {
  return useAppStatusStore(state => state.statuses.get(domain));
};

export const useHasErrors = (): boolean => {
  return useAppStatusStore(state => state.errors.size > 0);
};

export const useAllStatuses = (): DomainStatus[] => {
  return useAppStatusStore(state => Array.from(state.statuses.values()));
};
