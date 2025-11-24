import { create } from 'zustand';
<<<<<<< HEAD
=======
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistentStorage } from './storage';
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079

export type Theme = 'dark' | 'light' | 'auto';

export interface PanelVisibility {
  sidebar: boolean;
  watchlist: boolean;
  orderBook: boolean;
  trades: boolean;
  chat: boolean;
  alerts: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface UiStoreState {
  theme: Theme;
  panelVisibility: PanelVisibility;
<<<<<<< HEAD
=======
  devConsoleVisible: boolean;
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  isAppLoading: boolean;
  appLoadingMessage: string | null;
  toasts: ToastMessage[];
  devConsoleOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  setPanelVisibility: (panel: keyof PanelVisibility, visible: boolean) => void;
  togglePanel: (panel: keyof PanelVisibility) => void;
<<<<<<< HEAD
=======
  setDevConsoleVisible: (visible: boolean) => void;
  toggleDevConsole: () => void;
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setLoading: (isLoading: boolean, message?: string | null) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setDevConsoleOpen: (open: boolean) => void;
<<<<<<< HEAD
=======
  closeDevtools: () => void;
  openDevtools: () => void;
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  reset: () => void;
}

const defaultPanelVisibility: PanelVisibility = {
  sidebar: true,
  watchlist: true,
  orderBook: true,
  trades: true,
  chat: false,
  alerts: true,
};

const initialState = {
  theme: 'dark' as Theme,
  panelVisibility: defaultPanelVisibility,
<<<<<<< HEAD
=======
  devConsoleVisible: false,
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  notificationsEnabled: true,
  soundEnabled: true,
  animationsEnabled: true,
  compactMode: false,
  isAppLoading: false,
  appLoadingMessage: null as string | null,
  toasts: [] as ToastMessage[],
  devConsoleOpen: false,
};

<<<<<<< HEAD
export const useUiStore = create<UiStoreState>()((set, get) => ({
=======
export const useUiStore = create<UiStoreState>()(
  persist(
    (set, get) => ({
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
      ...initialState,

      setTheme: theme => {
        if (get().theme === theme) return;
        set({ theme });
      },

      setPanelVisibility: (panel, visible) => {
        set(state => ({
          panelVisibility: {
            ...state.panelVisibility,
            [panel]: visible,
          },
        }));
      },

      togglePanel: panel => {
        set(state => ({
          panelVisibility: {
            ...state.panelVisibility,
            [panel]: !state.panelVisibility[panel],
          },
        }));
      },

<<<<<<< HEAD
=======
      setDevConsoleVisible: visible => {
        if (get().devConsoleVisible === visible) return;
        set({ devConsoleVisible: visible });
      },

      toggleDevConsole: () => {
        set(state => ({ devConsoleVisible: !state.devConsoleVisible }));
      },

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
      setSidebarCollapsed: collapsed => {
        if (get().sidebarCollapsed === collapsed) return;
        set({ sidebarCollapsed: collapsed });
      },

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setCommandPaletteOpen: open => {
        if (get().commandPaletteOpen === open) return;
        set({ commandPaletteOpen: open });
      },

      setNotificationsEnabled: enabled => {
        if (get().notificationsEnabled === enabled) return;
        set({ notificationsEnabled: enabled });
      },

      setSoundEnabled: enabled => {
        if (get().soundEnabled === enabled) return;
        set({ soundEnabled: enabled });
      },

      setAnimationsEnabled: enabled => {
        if (get().animationsEnabled === enabled) return;
        set({ animationsEnabled: enabled });
      },

      setCompactMode: compact => {
        if (get().compactMode === compact) return;
        set({ compactMode: compact });
      },

      setLoading: (isLoading, message = null) => {
        set({
          isAppLoading: isLoading,
          appLoadingMessage: message,
        });
      },

      addToast: toast => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastMessage = {
          ...toast,
          id,
        };
        set(state => ({
          toasts: [...state.toasts, newToast],
        }));

        if (toast.duration) {
          setTimeout(() => {
            set(state => ({
              toasts: state.toasts.filter(t => t.id !== id),
            }));
          }, toast.duration);
        }
      },

      removeToast: id => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },

      setDevConsoleOpen: open => {
        if (get().devConsoleOpen === open) return;
        set({ devConsoleOpen: open });
      },

<<<<<<< HEAD
      reset: () => {
        set(initialState);
      },
    })

// Alias for consistency
export const useUIStore = useUiStore;

// Selector hook for panel visibility
export const usePanelVisibility = (panel: keyof PanelVisibility) => {
  return useUiStore(state => state.panelVisibility[panel]);
};
=======
      closeDevtools: () => {
        set({ devConsoleOpen: false });
      },

      openDevtools: () => {
        set({ devConsoleOpen: true });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'eclipse-ui-store',
      storage: createJSONStorage(getPersistentStorage),
      partialize: state => ({
        theme: state.theme,
        panelVisibility: state.panelVisibility,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsEnabled: state.notificationsEnabled,
        soundEnabled: state.soundEnabled,
        animationsEnabled: state.animationsEnabled,
        compactMode: state.compactMode,
        devConsoleOpen: state.devConsoleOpen,
      }),
    }
  )
);

export const useUIStore = useUiStore;

export const usePanelVisibility = (panel: keyof PanelVisibility) => {
  return useUiStore(state => state.panelVisibility[panel]);
};

export const useDevConsole = () => {
  return useUiStore(state => ({
    visible: state.devConsoleVisible,
    toggle: state.toggleDevConsole,
  }));
};
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
