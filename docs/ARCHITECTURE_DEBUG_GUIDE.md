# Architecture Debug Guide - eclipse-market-pro-v2

> **Last Updated:** 2024  
> **Purpose:** Complete technical architecture reference for debugging and development

This document captures the complete technical architecture of eclipse-market-pro-v2, including tech stack, build configuration, state management patterns, and known issues with solutions.

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [TypeScript & Build Configuration](#2-typescript--build-configuration)
3. [Store Architecture Foundation](#3-store-architecture-foundation)
4. [Complete Store Inventory](#4-complete-store-inventory)
5. [Current App Structure](#5-current-app-structure)
6. [Layout & Component Structure](#6-layout--component-structure)
7. [Event-Driven Architecture](#7-event-driven-architecture)
8. [Current Issues Summary](#8-current-issues-summary)
9. [How to Fix Common Issues](#9-how-to-fix-common-issues)
10. [Key Import Paths & Exports](#10-key-import-paths--exports)
11. [Testing Checklist](#11-testing-checklist)

---

## 1. Tech Stack & Dependencies

### Core Technologies

- **Frontend Framework:** React 18.2.0
- **Language:** TypeScript 5.0.0
- **Build Tool:** Vite 4.0.0
- **Desktop Framework:** Tauri 2.0.0
- **State Management:** Zustand 5.0.8
- **Routing:** React Router DOM 7.9.4
- **Styling:** Tailwind CSS 3.3.0

### Key Dependencies (package.json)

#### UI & Component Libraries
```json
{
  "@radix-ui/react-*": "1.x-2.x (Various)",
  "lucide-react": "^0.548.0",
  "framer-motion": "^12.23.24",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "cmdk": "1.0.4",
  "sonner": "^1.7.4",
  "vaul": "^0.9.9"
}
```

#### Blockchain & Wallet
```json
{
  "@solana/web3.js": "^1.98.4",
  "@solana/wallet-adapter-base": "^0.9.27",
  "@solana/wallet-adapter-phantom": "^0.9.28",
  "@solana/wallet-adapter-react": "0.15.0",
  "@solana/wallet-adapter-wallets": "0.15.0",
  "@ledgerhq/hw-app-solana": "^7.5.5",
  "@ledgerhq/hw-transport-webhid": "^6.30.8"
}
```

#### Data Visualization
```json
{
  "chart.js": "^4.4.8",
  "react-chartjs-2": "^5.3.0",
  "lightweight-charts": "^5.0.9",
  "recharts": "^3.3.0"
}
```

#### Form & Validation
```json
{
  "react-hook-form": "^7.60.0",
  "@hookform/resolvers": "^3.10.0",
  "zod": "3.25.76"
}
```

#### Tauri
```json
{
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/plugin-process": "^2.3.1",
  "@tauri-apps/plugin-updater": "^2.9.0"
}
```

#### Other Notable Dependencies
```json
{
  "qrcode": "^1.5.4",
  "date-fns": "^4.1.0",
  "rrweb": "^2.0.0-alpha.4",
  "rrweb-player": "^1.0.0-alpha.4",
  "@sentry/react": "^10.22.0",
  "allotment": "^1.20.4",
  "react-window": "^2.2.2",
  "xlsx": "^0.18.5"
}
```

### Dev Dependencies

```json
{
  "@tauri-apps/cli": "^2.0.0",
  "@vitejs/plugin-react": "^4.0.0",
  "@testing-library/react": "^14.3.1",
  "@testing-library/jest-dom": "^6.9.1",
  "@playwright/test": "^1.48.0",
  "vitest": "^1.6.0",
  "eslint": "^8.57.1",
  "prettier": "^3.6.2",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

### Node/NPM Requirements

- **Node.js:** >=18.0.0 (recommended: 20.x LTS)
- **npm:** >=9.0.0
- **Rust:** Latest stable (for Tauri builds)

---

## 2. TypeScript & Build Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "src-minimal", "tests", "vite.config.ts", "vitest.config.ts"]
}
```

**Key Settings:**
- **strict mode enabled** - Full TypeScript type checking
- **jsx: react-jsx** - Uses new JSX transform (no React import needed)
- **moduleResolution: node** - Standard Node.js module resolution
- **Path alias:** `@/*` maps to `./src/*`
- **Target:** ESNext for modern JS features

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome120' : 'safari14',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

**Key Settings:**
- **Dev server port:** 1420 (fixed for Tauri)
- **Alias resolution:** `@` → `src/`
- **Environment variables:** `VITE_*` and `TAURI_*` prefixes
- **Build target:** Platform-specific (Chrome 120 for Windows, Safari 14 for macOS)
- **Source maps:** Enabled in debug mode only

### Build Output

- **Development:** Hot module reloading at `http://localhost:1420`
- **Production:** Bundled into `dist/` directory
- **Tauri bundle:** Platform-specific executables in `src-tauri/target/release/bundle/`

---

## 3. Store Architecture Foundation

### Overview

All stores use Zustand 5 with a custom `createBoundStore` helper that ensures consistent patterns and prevents common pitfalls. The helper automatically applies `subscribeWithSelector` middleware to prevent stale snapshots.

### createBoundStore.ts (Complete)

```typescript
import {
  createStore as createZustandStore,
  useStore as useZustandStore,
  type StateCreator,
  type StoreApi,
} from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Re-export useShallow for convenience
export { useShallow } from 'zustand/react/shallow';

export type CreateStoreResult<T> = {
  store: StoreApi<T>;
  useStore: {
    (): T;
    <U>(selector: (state: T) => U, equalityFn?: (a: U, b: U) => boolean): U;
    getState: () => T;
  };
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

/**
 * Creates a bound Zustand store with subscribeWithSelector middleware enabled by default.
 * This ensures all stores can handle selective subscriptions and prevents stale snapshots.
 *
 * WHY THIS HELPER EXISTS:
 * 1. subscribeWithSelector middleware is required for streaming updates and real-time data
 * 2. Prevents "getSnapshot should be cached" warnings
 * 3. Enables selective subscriptions to specific state slices
 * 4. Provides consistent typing across all stores
 *
 * @param initializer - State creator function (set, get, api) => state
 * @returns Store result with typed hooks
 *
 * @example
 * ```typescript
 * const storeResult = createBoundStore<MyState>((set, get) => ({
 *   count: 0,
 *   increment: () => set(state => ({ count: state.count + 1 })),
 * }));
 *
 * export const useMyStore = storeResult.useStore;
 * ```
 */
export function createBoundStore<T>(
  initializer: StateCreator<T, [['zustand/subscribeWithSelector', never]], [], T>
): CreateStoreResult<T> {
  // Wrap initializer with subscribeWithSelector middleware
  const store = createZustandStore<T>()(subscribeWithSelector(initializer));

  const useStore: any = <U = T>(selector?: (state: T) => U, equalityFn?: (a: U, b: U) => boolean) => {
    return useZustandStore(store, selector as any, equalityFn as any);
  };

  // Add getState to useStore hook
  useStore.getState = store.getState;

  return {
    store,
    useStore,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
  };
}

/**
 * Creates a bound Zustand store with custom middleware.
 * Use this when you need to compose additional middleware like persist or devtools.
 * subscribeWithSelector is NOT automatically applied - you must include it if needed.
 *
 * WHEN TO USE THIS:
 * - Stores that need persistence (UI preferences, settings, themes)
 * - Stores that need devtools integration
 * - Stores with custom middleware
 *
 * IMPORTANT: Always wrap persist with subscribeWithSelector:
 * subscribeWithSelector(persist(...))
 *
 * @param creator - Middleware-wrapped state creator
 * @returns Store result with typed hooks
 *
 * @example
 * ```typescript
 * import { persist, createJSONStorage } from 'zustand/middleware';
 * import { getPersistentStorage } from './storage';
 *
 * const storeResult = createBoundStoreWithMiddleware<MyState>()(
 *   subscribeWithSelector(
 *     persist(
 *       (set, get) => ({
 *         theme: 'dark',
 *         setTheme: (theme) => set({ theme }),
 *       }),
 *       {
 *         name: 'my-store',
 *         storage: createJSONStorage(getPersistentStorage),
 *       }
 *     )
 *   )
 * );
 * ```
 */
export function createBoundStoreWithMiddleware<T>() {
  return (creator: any): CreateStoreResult<T> => {
    const store = createZustandStore<T>()(creator);

    const useStore: any = <U = T>(selector?: (state: T) => U, equalityFn?: (a: U, b: U) => boolean) => {
      return useZustandStore(store, selector as any, equalityFn as any);
    };

    // Add getState to useStore hook
    useStore.getState = store.getState;

    return {
      store,
      useStore,
      getState: store.getState,
      setState: store.setState,
      subscribe: store.subscribe,
    };
  };
}
```

### Why useShallow is Critical

**The Problem:**
```typescript
// ❌ BAD - Creates new object reference on EVERY render
const { field1, field2 } = useStore(state => ({
  field1: state.field1,
  field2: state.field2,
}));
// This causes infinite re-renders because the selector returns a NEW object each time
```

**The Solution:**
```typescript
// ✅ GOOD - useShallow compares object properties, not references
import { useShallow } from '@/store';
import { useCallback } from 'react';

const selector = useCallback(
  (state: ReturnType<typeof useStore.getState>) => ({
    field1: state.field1,
    field2: state.field2,
  }),
  []
);

const { field1, field2 } = useStore(selector, useShallow);
// Only re-renders when field1 or field2 actually change
```

### How to Properly Use the Helper

**Standard Store (No Persistence):**
```typescript
import { createBoundStore } from './createBoundStore';

interface MyStoreState {
  count: number;
  increment: () => void;
}

const storeResult = createBoundStore<MyStoreState>((set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

export const useMyStore = storeResult.useStore;
export const myStore = storeResult.store;
```

**Persisted Store:**
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { createBoundStoreWithMiddleware } from './createBoundStore';
import { getPersistentStorage } from './storage';

const storeResult = createBoundStoreWithMiddleware<MyStoreState>()(
  subscribeWithSelector(  // MUST wrap persist with this
    persist(
      (set, get) => ({
        theme: 'dark',
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'my-store',
        storage: createJSONStorage(getPersistentStorage),
      }
    )
  )
);

export const useMyStore = storeResult.useStore;
```

---

## 4. Complete Store Inventory

### 4.1 walletStore.ts

**Purpose:** Manages wallet accounts, token balances, fee estimates, and transaction workflows.

**Key State Fields:**
```typescript
{
  accounts: WalletAccount[];
  activeAccount: WalletAccount | null;
  balances: Record<string, TokenBalance[]>;
  addressBook: AddressBookContact[];
  sendWorkflow: SendWorkflow | null;
}
```

**Persistence:** No (runtime state only)

**Middleware:** `subscribeWithSelector` (via `createBoundStore`)

**Key Actions:**
- `fetchBalances(address, forceRefresh?)` - Fetch token balances from backend
- `refreshActiveAccountBalances()` - Convenience method for active account
- `estimateFee(recipient, amount, tokenMint?)` - Estimate transaction fees
- `sendTransaction(input, walletAddress)` - Execute transaction
- `addContact(request)` / `updateContact(request)` / `deleteContact(id)` - Address book CRUD
- `generateQR(data)` - Generate QR code
- `generateSolanaPayQR(...)` - Generate Solana Pay QR

**Selector Hooks:**
```typescript
useWalletBalances(address?: string)  // Get token balances
useActiveAccount()                   // Get active account
useAddressBook()                     // Get contacts
useWalletStatus()                    // Get { isLoading, error }
useSendWorkflow()                    // Get send workflow state
useSwapHistory()                     // Get swap history
```

**Example Usage:**
```typescript
import { useWalletStore, useActiveAccount } from '@/store';

const activeAccount = useActiveAccount();
const fetchBalances = useWalletStore(state => state.fetchBalances);

useEffect(() => {
  if (activeAccount) {
    fetchBalances(activeAccount.publicKey);
  }
}, [activeAccount, fetchBalances]);
```

---

### 4.2 tradingStore.ts

**Purpose:** Manages trading orders with optimistic updates, drafts, and real-time order state.

**Key State Fields:**
```typescript
{
  isInitialized: boolean;
  activeOrders: Order[];
  orderHistory: Order[];
  drafts: OrderDraft[];
  optimisticOrders: Map<string, Order>;
}
```

**Persistence:** No (runtime state only)

**Middleware:** `subscribeWithSelector` (via `createBoundStore`)

**Key Actions:**
- `initialize()` - Initialize trading module (call once on app start)
- `createOrder(request)` - Create order with optimistic UI update
- `cancelOrder(orderId)` - Cancel order with optimistic rollback
- `getActiveOrders(walletAddress)` - Fetch active orders
- `getOrderHistory(walletAddress, limit?)` - Fetch order history
- `quickTrade(request)` - Execute quick market trade
- `addDraft(request)` / `updateDraft(id, request)` / `deleteDraft(id)` - Order draft management
- `handleOrderUpdate(update)` - Handle real-time order updates from backend

**Optimistic Updates Pattern:**
```typescript
// When creating an order:
// 1. Add optimistic order to map
// 2. Make backend call
// 3. On success: remove optimistic, add real order
// 4. On error: remove optimistic, show error
```

**Selector Hooks:**
```typescript
useActiveOrders()                    // Get active orders
useOrderDrafts()                     // Get drafts
useCombinedOrders()                  // Get optimistic + active orders
```

**Example Usage:**
```typescript
import { useTradingStore, useCombinedOrders } from '@/store';

const orders = useCombinedOrders(); // Includes optimistic orders
const createOrder = useTradingStore(state => state.createOrder);

const handleCreateOrder = async (request) => {
  try {
    await createOrder(request);
  } catch (error) {
    // Handle error
  }
};
```

---

### 4.3 portfolioStore.ts

**Purpose:** Manages portfolio positions, analytics, sector allocations, and concentration alerts.

**Key State Fields:**
```typescript
{
  positions: Position[];
  analyticsCache: Record<string, AnalyticsCache>;  // 5-minute TTL
  sectorAllocations: SectorAllocation[];
  concentrationAlerts: ConcentrationAlert[];
  totalValue: number;
  totalPnl: number;
}
```

**Persistence:** No (runtime state only)

**Middleware:** `subscribeWithSelector` (via `createBoundStore`)

**Key Actions:**
- `setPositions(positions)` - Update positions and recalculate totals
- `fetchAnalytics(walletAddress, forceRefresh?)` - Fetch analytics (cached 5min)
- `fetchSectorAllocations(walletAddress)` - Fetch sector breakdown
- `refreshPortfolio(walletAddress)` - Refresh all portfolio data
- `checkConcentrationAlerts()` - Auto-detect risk concentration (>30% = warning, >40% = critical)

**Caching Strategy:**
- Analytics cached for 5 minutes per wallet address
- `forceRefresh=true` bypasses cache
- Cache key: wallet address

**Selector Hooks:**
```typescript
usePositions()                       // Get positions
useSectorAllocations()               // Get sector allocations
useConcentrationAlerts()             // Get concentration alerts
usePortfolioTotals()                 // Get { totalValue, totalPnl, totalPnlPercent }
usePortfolioStatus()                 // Get { isLoading, error }
useAnalyticsCache()                  // Get analytics cache
```

---

### 4.4 aiStore.ts

**Purpose:** Manages AI chat, pattern warnings, streaming responses, and portfolio optimization.

**Key State Fields:**
```typescript
{
  chatHistory: ChatMessage[];
  patternWarnings: PatternWarning[];
  streamingMetadata: StreamingMetadata | null;
  currentResponse: string;
  isStreaming: boolean;
}
```

**Persistence:** No (runtime state only)

**Middleware:** `subscribeWithSelector` (via `createBoundStore`)

**Key Actions:**
- `sendMessage(message, commandType?)` - Send message (non-streaming)
- `sendMessageStream(message, commandType?)` - Send message with streaming response
- `fetchPatternWarnings()` - Get pattern warnings
- `dismissPatternWarning(warningId)` - Dismiss warning
- `optimizePortfolio(holdings)` - Request portfolio optimization
- `applyOptimization(optimizationId)` - Apply optimization recommendations
- `submitFeedback(messageId, score, comment)` - Submit feedback on AI response
- `executeQuickAction(actionId, actionType, token, amount?)` - Execute AI-suggested action

**Streaming Pattern:**
```typescript
// 1. Call sendMessageStream
// 2. Listen to event: `ai:chat:${streamId}`
// 3. Accumulate chunks in currentResponse
// 4. On done=true, add to chatHistory and reset
```

**Selector Hooks:**
```typescript
useChatHistory()                     // Get chat history
usePatternWarnings()                 // Get pattern warnings
useStreamingStatus()                 // Get { isStreaming, currentResponse, metadata }
```

---

### 4.5 uiStore.ts

**Purpose:** Manages UI preferences, panel visibility, dev console, toasts, and global loading states.

**Key State Fields:**
```typescript
{
  theme: Theme;  // 'dark' | 'light' | 'auto'
  panelVisibility: PanelVisibility;
  devConsoleVisible: boolean;
  sidebarCollapsed: boolean;
  toasts: ToastMessage[];
}
```

**Persistence:** Yes (localStorage via Tauri)

**Middleware:** `subscribeWithSelector` + `persist` (via `createBoundStoreWithMiddleware`)

**Persisted Fields:**
- `theme`
- `panelVisibility`
- `sidebarCollapsed`
- `notificationsEnabled`
- `soundEnabled`
- `animationsEnabled`
- `compactMode`
- `devConsoleVisible`

**Key Actions:**
- `setTheme(theme)` - Change theme
- `togglePanel(panel)` / `setPanelVisibility(panel, visible)` - Toggle panel visibility
- `toggleDevConsole()` / `setDevConsoleVisible(visible)` - Dev console control
- `toggleSidebar()` / `setSidebarCollapsed(collapsed)` - Sidebar control
- `addToast(toast)` / `removeToast(id)` / `clearToasts()` - Toast management
- `setLoading(isLoading, message?)` - Global loading state

**Selector Hooks:**
```typescript
usePanelVisibility(panel)            // Get panel visibility
useDevConsole()                      // Get { visible, toggle }
useTheme()                           // Get current theme
useToasts()                          // Get active toasts
```

---

### 4.6 themeStore.ts

**Purpose:** Manages custom theme definitions, color schemes, and theme persistence.

**Key State Fields:**
```typescript
{
  activeThemeId: string;
  currentTheme: ThemeDefinition;
  customThemes: ThemeDefinition[];
}
```

**Built-in Themes:**
- **Eclipse** (default) - Purple/orange accent
- **Midnight** - Blue accent
- **Cyber** - Pink/green accent
- **Lunar** - Blue/yellow accent

**Persistence:** Yes (localStorage via Tauri)

**Middleware:** `subscribeWithSelector` + `persist` (via `createBoundStoreWithMiddleware`)

**Persisted Fields:**
- `activeThemeId`
- `customThemes`

**Key Actions:**
- `setActiveTheme(id)` - Switch to theme
- `createCustomTheme(name, colors)` - Create custom theme
- `updateCustomTheme(id, colors)` - Update custom theme
- `deleteCustomTheme(id)` - Delete custom theme
- `exportTheme(id)` - Export theme as JSON
- `importTheme(payload)` - Import theme from JSON
- `listThemes()` - Get all themes (built-in + custom)

**Selector Hooks:**
```typescript
useCurrentTheme()                    // Get current theme
useCustomThemes()                    // Get custom themes list
```

---

### 4.7 accessibilityStore.ts

**Purpose:** Manages accessibility preferences like font scaling, high contrast, reduced motion.

**Key State Fields:**
```typescript
{
  fontScale: number;  // 1.0 - 2.0
  highContrastMode: boolean;
  reducedMotion: boolean;
  screenReaderOptimizations: boolean;
  keyboardNavigationHints: boolean;
  focusIndicatorEnhanced: boolean;
}
```

**Persistence:** Yes (localStorage via Tauri)

**Middleware:** `subscribeWithSelector` + `persist` (via `createBoundStoreWithMiddleware`)

**All fields are persisted.**

**Key Actions:**
- `setFontScale(value)` - Set font scale (clamped to 1.0-2.0)
- `toggleHighContrast()` - Toggle high contrast mode
- `toggleReducedMotion()` - Toggle reduced motion
- `toggleScreenReaderOptimizations()` - Toggle screen reader optimizations
- `toggleKeyboardNavigationHints()` - Toggle keyboard hints
- `toggleFocusIndicatorEnhanced()` - Toggle enhanced focus indicators
- `resetToDefaults()` - Reset all to defaults

**Selector Hooks:**
```typescript
useFontScale()                       // Get font scale
useHighContrastMode()                // Get high contrast mode
useReducedMotion()                   // Get reduced motion
```

---

### 4.8 marketDataStore.ts

**Purpose:** Manages real-time market data, price updates, and new coin discoveries.

**Key State Fields:**
```typescript
{
  prices: Map<string, PriceData>;
  newCoins: NewCoin[];  // Max 100
  streamStatus: StreamStatus | null;
  isConnected: boolean;
  subscribedSymbols: Set<string>;
}
```

**Persistence:** No (runtime state only)

**Middleware:** `subscribeWithSelector` (via `createBoundStore`)

**Key Actions:**
- `updatePrice(priceData)` - Update single price
- `updatePrices(priceDataArray)` - Batch update prices
- `addNewCoin(coin)` / `addNewCoins(coins)` - Add new coins (deduplicated)
- `setStreamStatus(status)` - Update stream status
- `setConnected(connected)` - Update connection state
- `subscribeSymbol(symbol)` / `unsubscribeSymbol(symbol)` - Manage subscriptions
- `clearNewCoins()` - Clear new coins list

**Selector Hooks:**
```typescript
usePrice(symbol)                     // Get price data for symbol
useNewCoins(filter?)                 // Get new coins (with optional filters)
useStreamConnected()                 // Get connection status
usePriceMap()                        // Get entire price map
```

**Filter Options:**
```typescript
{
  minSafetyScore?: number;
  maxAge?: number;        // hours
  minLiquidity?: number;
}
```

---

## 5. Current App Structure

### App.tsx (Complete)

```typescript
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';
import { APIProvider } from '@/lib/api-context';
import ClientLayout from '@/layouts/ClientLayout';
import Dashboard from '@/pages/Dashboard';
// ... (50+ page imports)

function App() {
  return (
    <AppErrorBoundary>
      <APIProvider>
        <AccessibilityProvider>
          <HashRouter>
            <ClientLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Main Pages */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                
                {/* AI Pages */}
                <Route path="/ai" element={<AIPage />} />
                <Route path="/ai/assistant" element={<AIAssistantPage />} />
                <Route path="/ai/predictions" element={<AIPredictionsPage />} />
                <Route path="/ai/risk" element={<AIRiskPage />} />
                
                {/* Market Pages */}
                <Route path="/market" element={<MarketPage />} />
                <Route path="/market/trends" element={<MarketTrendsPage />} />
                <Route path="/market/fresh-coins" element={<FreshCoinsPage />} />
                <Route path="/market/fresh-buyers" element={<FreshBuyersPage />} />
                <Route path="/market/sentiment" element={<MarketSentimentPage />} />
                <Route path="/market/watchlist" element={<MarketWatchlistPage />} />
                
                {/* Governance Pages */}
                <Route path="/governance" element={<GovernancePage />} />
                <Route path="/governance/proposals" element={<GovernanceProposalsPage />} />
                <Route path="/governance/alerts" element={<GovernanceAlertsPage />} />
                <Route path="/governance/voice" element={<GovernanceVoicePage />} />
                
                {/* Portfolio Sub-pages */}
                <Route path="/portfolio/holdings" element={<PortfolioHoldingsPage />} />
                <Route path="/portfolio/positions" element={<PortfolioPositionsPage />} />
                <Route path="/portfolio/performance" element={<PortfolioPerformancePage />} />
                <Route path="/portfolio/history" element={<PortfolioHistoryPage />} />
                <Route path="/portfolio/wallets" element={<PortfolioWalletsPage />} />
                
                {/* Trading Sub-pages */}
                <Route path="/trading/spot" element={<TradingSpotPage />} />
                <Route path="/trading/futures" element={<TradingFuturesPage />} />
                <Route path="/trading/p2p" element={<TradingP2PPage />} />
                <Route path="/trading/paper" element={<TradingPaperPage />} />
                <Route path="/trading/orderbook" element={<TradingOrderbookPage />} />
                
                {/* Other Pages */}
                <Route path="/learning" element={<LearningPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/workspaces" element={<WorkspacesPage />} />
                <Route path="/coin/:symbol" element={<CoinDetailPage />} />
                
                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ClientLayout>
          </HashRouter>
        </AccessibilityProvider>
      </APIProvider>
    </AppErrorBoundary>
  );
}

export default App;
```

### Provider Hierarchy

```
AppErrorBoundary
  └─ APIProvider
      └─ AccessibilityProvider
          └─ HashRouter
              └─ ClientLayout
                  └─ Routes + Pages
```

**Why HashRouter?**
- Required for Tauri desktop apps
- Provides client-side routing without a web server
- URLs use `#/path` format

**What Was Removed:**
- No Redux (replaced with Zustand)
- No Context API for state (replaced with Zustand)
- Minimal provider nesting (only essential providers)

---

## 6. Layout & Component Structure

### ClientLayout (Complete)

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { useTradingEventBridge } from '@/hooks/useTradingEventBridge';
import { useMarketStreamBridge } from '@/hooks/useMarketStreamBridge';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Event bridges connect Tauri events to stores
  useTradingEventBridge();
  useMarketStreamBridge();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto fade-in">{children}</main>
      </div>
    </div>
  );
}
```

**Key Responsibilities:**
- Renders sidebar + main content area
- Mounts event bridges (once per app lifetime)
- Provides base layout structure

**Event Bridges:**
- `useTradingEventBridge()` - Trading/wallet events
- `useMarketStreamBridge()` - Market data streams

---

## 7. Event-Driven Architecture

### How Events Flow from Tauri to Stores

```
Rust Backend (Tauri)
  ↓ (emit event)
Tauri Event System
  ↓ (listen)
Event Bridge Hooks (in ClientLayout)
  ↓ (call store actions)
Zustand Stores
  ↓ (trigger re-renders)
React Components
```

### useTradingEventBridge Hook

**Purpose:** Connects Tauri trading/wallet events to frontend stores.

**Events Listened To:**
1. `order_update` - Order status changes → `tradingStore.handleOrderUpdate()`
2. `order_triggered` - Stop/limit order triggered → Show toast
3. `transaction_update` - Helius WebSocket transaction → Refresh balances
4. `copy_trade_execution` - Copy trade executed → Show toast + refresh balances
5. `order_monitoring_stopped` - Order monitoring stopped → Show error

**Key Pattern:**
```typescript
const unlistenOrderUpdate = await listen<Order>('order_update', event => {
  if (!mounted) return;
  
  const order = event.payload;
  const update: OrderUpdate = {
    orderId: order.id,
    status: order.status,
    filledAmount: order.filledAmount,
    txSignature: order.txSignature,
    errorMessage: order.errorMessage,
  };
  
  tradingStore.getState().handleOrderUpdate(update);
  
  // Refresh wallet balances after successful fill
  if (order.status === 'filled' && order.walletAddress) {
    walletStore.getState().fetchBalances(order.walletAddress, true);
  }
});
```

**Cleanup:**
```typescript
return () => {
  mounted = false;
  unlistenersRef.current.forEach(unlisten => unlisten());
  unlistenersRef.current = [];
};
```

### walletStore.refreshActiveAccountBalances()

**Convenience Method:**
```typescript
refreshActiveAccountBalances: async () => {
  const activeAccount = get().activeAccount;
  if (activeAccount) {
    await get().fetchBalances(activeAccount.publicKey, true);
  }
}
```

Used by event bridges to refresh balances after transactions.

---

## 8. Current Issues Summary

### Infinite Loop Issue (RESOLVED)

**Root Cause:**
Selector hooks were creating new object references on every render, causing infinite re-renders.

**Affected Components:**
- Any component importing store selectors that return objects/arrays without proper memoization

**Symptoms:**
1. Blank screen on app load
2. Console flooded with "Maximum update depth exceeded" errors
3. Browser tab crashes after 10-20 seconds
4. "getSnapshot should be cached" warnings

**Example of Broken Code:**
```typescript
// ❌ BAD - Creates new object every render
export const useSettings = () => {
  return useSettingsStore(state => ({
    paperTrading: state.paperTrading,
    quickBuys: state.quickBuys,
  }));
};
```

**Why It Breaks:**
1. Component calls `useSettings()`
2. Selector creates `{ paperTrading, quickBuys }` object
3. Zustand compares with previous result (by reference)
4. Objects are always different references → triggers re-render
5. Re-render calls `useSettings()` again → Go to step 2
6. **INFINITE LOOP**

---

## 9. How to Fix Common Issues

### 9.1 Fixing Selector Hooks (The Correct Pattern)

**Before (Broken):**
```typescript
export const useSettings = () => {
  return useSettingsStore(state => ({
    paperTrading: state.paperTrading,
    quickBuys: state.quickBuys,
  }));
};
```

**After (Fixed):**
```typescript
import { useCallback } from 'react';
import { useShallow } from '@/store';

export const useSettings = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useSettingsStore.getState>) => ({
      paperTrading: state.paperTrading,
      quickBuys: state.quickBuys,
    }),
    []
  );
  
  return useSettingsStore(selector, useShallow);
};
```

**Why This Works:**
1. `useCallback` ensures selector function has stable identity
2. `useShallow` compares object properties, not references
3. Component only re-renders when `paperTrading` or `quickBuys` actually change

---

### 9.2 Pattern for ALL Selector Hooks

```typescript
import { useCallback } from 'react';
import { useShallow } from '@/store';

// For primitive values (string, number, boolean) - no useShallow needed
export const useSingleValue = () => {
  return useStore(state => state.value);
};

// For objects/arrays - MUST use useCallback + useShallow
export const useMultipleValues = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useStore.getState>) => ({
      value1: state.value1,
      value2: state.value2,
      action: state.action,
    }),
    []
  );
  
  return useStore(selector, useShallow);
};

// For computed values - MUST use useCallback + useShallow
export const useComputedValue = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useStore.getState>) => ({
      total: state.items.reduce((sum, item) => sum + item.value, 0),
      items: state.items,
    }),
    []
  );
  
  return useStore(selector, useShallow);
};
```

---

### 9.3 Before/After Examples

#### Example 1: Paper Trading Hook

**Before:**
```typescript
export const usePaperTrading = () => {
  return useSettingsStore(state => state.paperTrading);
};
```

**After:**
```typescript
// This is fine - returning primitive object
export const usePaperTrading = () => {
  return useSettingsStore(state => state.paperTrading);
};
```

**Note:** If `paperTrading` is an object, use the object pattern with `useShallow`.

---

#### Example 2: Quick Buys Hook

**Before:**
```typescript
export const useQuickBuys = () => {
  return useSettingsStore(state => state.quickBuys);  // Array
};
```

**After:**
```typescript
import { useCallback } from 'react';
import { useShallow } from '@/store';

export const useQuickBuys = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useSettingsStore.getState>) => ({
      quickBuys: state.quickBuys,
    }),
    []
  );
  
  return useSettingsStore(selector, useShallow).quickBuys;
};
```

**Or simpler (if store already has shallow comparison):**
```typescript
export const useQuickBuys = () => {
  return useSettingsStore(state => state.quickBuys);
};
```

**Note:** Arrays can be tricky. If the array reference changes but content is the same, use `useShallow` pattern.

---

#### Example 3: Multiple Values Hook

**Before:**
```typescript
export const useLLMConfig = () => {
  return useSettingsStore(state => ({
    provider: state.llmProvider,
    apiKey: state.apiKeys[state.llmProvider],
  }));
};
```

**After:**
```typescript
import { useCallback } from 'react';
import { useShallow } from '@/store';

export const useLLMConfig = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useSettingsStore.getState>) => ({
      provider: state.llmProvider,
      apiKey: state.apiKeys[state.llmProvider],
    }),
    []
  );
  
  return useSettingsStore(selector, useShallow);
};
```

---

### 9.4 useEffect Dependencies with Store Actions

**Common Mistake:**
```typescript
const fetchBalances = useWalletStore(state => state.fetchBalances);

useEffect(() => {
  fetchBalances(address);
}, [address]);  // ❌ Missing fetchBalances dependency
```

**Fixed:**
```typescript
const fetchBalances = useWalletStore(state => state.fetchBalances);

useEffect(() => {
  fetchBalances(address);
}, [address, fetchBalances]);  // ✅ All dependencies included
```

**Why:** ESLint will warn about missing dependencies. Store actions are stable references, so including them is safe.

---

### 9.5 Avoiding Stale Closures

**Problem:**
```typescript
const activeAccount = useActiveAccount();

const handleClick = () => {
  // activeAccount might be stale here
  console.log(activeAccount);
};
```

**Solution 1: Use getState:**
```typescript
import { walletStore } from '@/store';

const handleClick = () => {
  const activeAccount = walletStore.getState().activeAccount;
  console.log(activeAccount);
};
```

**Solution 2: Use useCallback with dependencies:**
```typescript
const activeAccount = useActiveAccount();

const handleClick = useCallback(() => {
  console.log(activeAccount);
}, [activeAccount]);
```

---

## 10. Key Import Paths & Exports

### 10.1 Path Alias Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
{
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
}
```

**Usage:**
```typescript
import { useWalletStore } from '@/store';
import { Button } from '@/components/ui/button';
import { tauriHealthCheck } from '@/utils/tauri';
```

---

### 10.2 Store Exports (src/store/index.ts)

```typescript
export * from './createBoundStore';      // createBoundStore, createBoundStoreWithMiddleware, useShallow
export * from './walletStore';           // useWalletStore, walletStore, selector hooks
export * from './tradingStore';          // useTradingStore, tradingStore, selector hooks
export * from './portfolioStore';        // usePortfolioStore, portfolioStore, selector hooks
export * from './aiStore';               // useAiStore, aiStore, selector hooks
export * from './uiStore';               // useUiStore, uiStore, selector hooks
export * from './themeStore';            // useThemeStore, themeStore, selector hooks
export * from './accessibilityStore';    // useAccessibilityStore, accessibilityStore, selector hooks
export * from './marketDataStore';       // useMarketDataStore, marketDataStore, selector hooks
```

**What's Exported:**
- Store hooks (`useWalletStore`, `useTradingStore`, etc.)
- Store instances (`walletStore`, `tradingStore`, etc.)
- Selector hooks (`useActiveAccount`, `useActiveOrders`, etc.)
- Helper functions (`createBoundStore`, `useShallow`)

---

### 10.3 Common Import Patterns

#### ✅ Correct Patterns

```typescript
// Import store hook
import { useWalletStore } from '@/store';

// Import multiple stores
import { useWalletStore, useTradingStore } from '@/store';

// Import selector hooks
import { useActiveAccount, useActiveOrders } from '@/store';

// Import useShallow for object selectors
import { useWalletStore, useShallow } from '@/store';
import { useCallback } from 'react';

const selector = useCallback(
  (state: ReturnType<typeof useWalletStore.getState>) => ({
    accounts: state.accounts,
    activeAccount: state.activeAccount,
  }),
  []
);

const { accounts, activeAccount } = useWalletStore(selector, useShallow);

// Import store instance for getState()
import { walletStore } from '@/store';
const activeAccount = walletStore.getState().activeAccount;
```

#### ❌ Incorrect Patterns

```typescript
// ❌ Don't import from store file directly
import { useWalletStore } from '@/store/walletStore';  // Should use @/store

// ❌ Don't call store hooks conditionally
if (condition) {
  const data = useWalletStore(state => state.data);  // Violates React Hooks Rules
}

// ❌ Don't call store hooks in try-catch
try {
  const data = useWalletStore(state => state.data);  // Violates React Hooks Rules
} catch (error) {}

// ❌ Don't forget useShallow for object selectors
const { field1, field2 } = useStore(state => ({
  field1: state.field1,
  field2: state.field2,
}));  // Infinite loop!

// ❌ Don't forget to memoize selector
const data = useStore(state => ({ ... }), useShallow);  // Selector recreated every render
```

---

### 10.4 Type Imports

```typescript
// Import types from types directory
import type { Order, TokenBalance, ChatMessage } from '@/types';

// Import store types from store files
import type { WalletAccount, SendWorkflow } from '@/store/walletStore';
import type { OrderDraft } from '@/store/tradingStore';

// Import component prop types
import type { ButtonProps } from '@/components/ui/button';
```

---

## 11. Testing Checklist

### 11.1 After Store Changes

- [ ] **Build passes:** `npm run build`
- [ ] **TypeScript checks pass:** `tsc --noEmit`
- [ ] **Linting passes:** `npm run lint`
- [ ] **Unit tests pass:** `npm test`
- [ ] **Store-specific tests pass:** `npm test -- tests/stores/`

---

### 11.2 After Selector Hook Changes

- [ ] **No "getSnapshot should be cached" warnings** in browser console
- [ ] **No "Maximum update depth exceeded" errors** in browser console
- [ ] **Component using selector renders correctly**
- [ ] **Component only re-renders when selected state changes**
- [ ] **useCallback wraps selector function**
- [ ] **useShallow is used for object/array selectors**

---

### 11.3 Pages to Test After Changes

**Core Pages:**
- [ ] Dashboard (`/dashboard`)
- [ ] Portfolio (`/portfolio`)
- [ ] Trading (`/trading`)
- [ ] Settings (`/settings`)

**Trading Pages:**
- [ ] Trading Spot (`/trading/spot`)
- [ ] Trading Paper (`/trading/paper`)
- [ ] Trading Order Book (`/trading/orderbook`)

**Portfolio Pages:**
- [ ] Portfolio Holdings (`/portfolio/holdings`)
- [ ] Portfolio Wallets (`/portfolio/wallets`)

**AI Pages:**
- [ ] AI Assistant (`/ai/assistant`)
- [ ] AI Predictions (`/ai/predictions`)

**Market Pages:**
- [ ] Market Trends (`/market/trends`)
- [ ] Fresh Coins (`/market/fresh-coins`)
- [ ] Market Watchlist (`/market/watchlist`)

---

### 11.4 Console Checks

**Open browser dev console and verify:**

- [ ] No infinite loop errors
- [ ] No "getSnapshot should be cached" warnings
- [ ] No "Maximum update depth exceeded" errors
- [ ] No repeated log messages (indicates infinite loops)
- [ ] Event bridge listeners registered successfully
- [ ] Store hydration (from persistence) works correctly

---

### 11.5 Manual Testing Workflow

1. **Clear storage:** Open dev console → Application → Local Storage → Clear All
2. **Hard refresh:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. **Navigate to each page** in the checklist
4. **Interact with components** that use the changed store
5. **Monitor console** for errors/warnings
6. **Verify state persistence** (if applicable):
   - Change settings
   - Refresh page
   - Verify settings persist

---

### 11.6 E2E Testing

**Run Playwright tests:**
```bash
npm run test:e2e
```

**Key test suites:**
- `tests/e2e/wallet.spec.ts` - Wallet connection and transactions
- `tests/e2e/trading.spec.ts` - Order creation and management
- `tests/e2e/portfolio.spec.ts` - Portfolio viewing and analytics
- `tests/e2e/ai.spec.ts` - AI chat and interactions

---

## Appendix: Quick Reference

### Store Overview Table

| Store | Persistence | Middleware | Key State | Primary Use Case |
|-------|-------------|------------|-----------|------------------|
| walletStore | No | subscribeWithSelector | accounts, balances | Wallet operations |
| tradingStore | No | subscribeWithSelector | orders, drafts | Trading & order management |
| portfolioStore | No | subscribeWithSelector | positions, analytics | Portfolio tracking |
| aiStore | No | subscribeWithSelector | chatHistory, streaming | AI interactions |
| uiStore | Yes | subscribeWithSelector + persist | theme, panels, toasts | UI preferences |
| themeStore | Yes | subscribeWithSelector + persist | themes, colors | Theme management |
| accessibilityStore | Yes | subscribeWithSelector + persist | a11y settings | Accessibility |
| marketDataStore | No | subscribeWithSelector | prices, newCoins | Market data streams |

---

### Selector Hook Patterns

```typescript
// ✅ PRIMITIVE VALUE (no useShallow needed)
export const useSingleValue = () => {
  return useStore(state => state.value);
};

// ✅ OBJECT/ARRAY (useCallback + useShallow required)
export const useMultipleValues = () => {
  const selector = useCallback(
    (state: ReturnType<typeof useStore.getState>) => ({
      value1: state.value1,
      value2: state.value2,
    }),
    []
  );
  return useStore(selector, useShallow);
};
```

---

### Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run tauri dev              # Start Tauri app

# Building
npm run build                  # Build frontend
npm run tauri build            # Build Tauri app

# Testing
npm test                       # Run unit tests
npm run test:e2e               # Run E2E tests
npm run test:e2e:ui            # Run E2E tests with UI

# Linting & Formatting
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint issues
npm run format                 # Format with Prettier
npm run format:check           # Check formatting

# Type Checking
tsc --noEmit                   # Check TypeScript types
```

---

### Event Bridge Events

| Event Name | Source | Payload | Handler |
|------------|--------|---------|---------|
| `order_update` | OrderManager | Order | tradingStore.handleOrderUpdate() |
| `order_triggered` | OrderManager | OrderTriggeredEvent | Show toast |
| `transaction_update` | HeliusStream | TransactionUpdateEvent | walletStore.fetchBalances() |
| `copy_trade_execution` | CopyTradeManager | CopyTradeExecutionEvent | Show toast + refresh |
| `order_monitoring_stopped` | OrderManager | string | Show error toast |

---

## Conclusion

This guide provides a complete reference for understanding and debugging the eclipse-market-pro-v2 architecture. Key takeaways:

1. **Always use `useCallback` + `useShallow`** for object/array selectors
2. **Event bridges** connect Tauri events to stores in ClientLayout
3. **Stores use `subscribeWithSelector`** middleware by default
4. **Persistence** is only used for UI preferences (uiStore, themeStore, accessibilityStore)
5. **Path alias `@/`** maps to `src/`

For specific implementation details, refer to the source files referenced throughout this document.
