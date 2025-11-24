# Zustand Stores

This directory contains Zustand 5 stores for Eclipse Market Pro. All stores use the `createBoundStore` helper for consistent patterns and export typed hooks for easy consumption.

## Architecture

- **createBoundStore.ts** - Helper that creates Zustand stores with typed hooks and re-exports `useShallow` from `zustand/react/shallow`
- **walletStore.ts** - Wallet accounts, balances, fee estimates, send workflow
- **tradingStore.ts** - Orders, drafts, optimistic updates (uses `subscribeWithSelector`)
- **portfolioStore.ts** - Positions, analytics cache, sector allocation
- **aiStore.ts** - Chat history, pattern warnings, streaming metadata (uses `subscribeWithSelector`)
- **uiStore.ts** - Theme, panel visibility, dev console toggle (uses `persist`)
- **themeStore.ts** - Custom theme management (uses `persist`)
- **accessibilityStore.ts** - Accessibility preferences

## Usage

### Basic Store Access

```typescript
import { useWalletStore } from '@/store';

function MyComponent() {
  // Get entire state (will re-render on any change)
  const state = useWalletStore();
  
  // Select specific state (will only re-render when this changes)
  const accounts = useWalletStore(state => state.accounts);
  
  // Get an action
  const fetchBalances = useWalletStore(state => state.fetchBalances);
}
```

### Using Shallow Comparison for Multiple Fields

When selecting multiple fields, use `useShallow` to prevent unnecessary re-renders:

```typescript
import { useWalletStore, useShallow } from '@/store';
import { useCallback } from 'react';

function MyComponent() {
  // CORRECT: Use shallow comparison for object/array selectors
  const selector = useCallback(
    (state: ReturnType<typeof useWalletStore.getState>) => ({
      accounts: state.accounts,
      activeAccount: state.activeAccount,
      fetchBalances: state.fetchBalances,
    }),
    []
  );
  
  const { accounts, activeAccount, fetchBalances } = useWalletStore(selector, useShallow);
  
  // Component only re-renders if accounts, activeAccount, or fetchBalances change
}
```

### Using Convenience Hooks

Each store exports convenience hooks for common selections:

```typescript
import { useWalletBalances, useActiveAccount, useAddressBook } from '@/store';

function MyComponent() {
  const balances = useWalletBalances('wallet-address');
  const activeAccount = useActiveAccount();
  const contacts = useAddressBook();
}
```

## Store Details

### WalletStore

Manages wallet accounts, token balances, and transaction workflows.

**State:**
- `accounts`: Array of wallet accounts
- `activeAccount`: Currently selected account
- `balances`: Token balances per address
- `feeEstimates`: Cached fee estimates
- `addressBook`: Saved contacts
- `sendWorkflow`: Multi-step send transaction state

**Key Actions:**
- `fetchBalances(address, forceRefresh?)` - Fetch token balances
- `estimateFee(recipient, amount, tokenMint?)` - Estimate transaction fee
- `sendTransaction(input, walletAddress)` - Send transaction
- `startSendWorkflow(input)` - Begin send flow

**Example:**
```typescript
const fetchBalances = useWalletStore(state => state.fetchBalances);
const balances = useWalletBalances('my-wallet-address');

useEffect(() => {
  fetchBalances('my-wallet-address');
}, [fetchBalances]);
```

### TradingStore

Manages orders with optimistic updates and draft support. Uses `subscribeWithSelector` for real-time order updates.

**State:**
- `isInitialized`: Whether trading module is initialized
- `activeOrders`: Current active orders
- `orderHistory`: Past orders
- `drafts`: Saved order drafts
- `optimisticOrders`: Orders being created (optimistic UI)

**Key Actions:**
- `initialize()` - Initialize trading module (call once on app start)
- `createOrder(request)` - Create order with optimistic update
- `cancelOrder(orderId)` - Cancel order
- `getActiveOrders(walletAddress)` - Fetch active orders
- `addDraft(request)` - Save order as draft
- `handleOrderUpdate(update)` - Handle real-time order updates

**Example:**
```typescript
const { createOrder, activeOrders } = useWalletStore(
  useCallback(state => ({
    createOrder: state.createOrder,
    activeOrders: state.activeOrders,
  }), []),
  useShallow
);

const handleSubmit = async () => {
  await createOrder({
    orderType: 'limit',
    side: 'buy',
    amount: 1.5,
    limitPrice: 100,
    // ...
  });
};
```

### PortfolioStore

Manages portfolio positions and analytics with caching.

**State:**
- `positions`: Current positions
- `analyticsCache`: Cached analytics per wallet (5min TTL)
- `sectorAllocations`: Asset allocation by sector
- `concentrationAlerts`: Risk concentration warnings
- `totalValue`, `totalPnl`, `totalPnlPercent`: Portfolio totals

**Key Actions:**
- `setPositions(positions)` - Update positions
- `fetchAnalytics(walletAddress, forceRefresh?)` - Fetch analytics (cached)
- `fetchSectorAllocations(walletAddress)` - Fetch sector breakdown
- `refreshPortfolio(walletAddress)` - Refresh all portfolio data

**Example:**
```typescript
const { positions, totalValue } = usePortfolioStore(
  useCallback(state => ({
    positions: state.positions,
    totalValue: state.totalValue,
  }), []),
  useShallow
);
```

### AiStore

Manages AI chat, pattern warnings, and streaming responses. Uses `subscribeWithSelector` for streaming updates.

**State:**
- `chatHistory`: Conversation messages
- `patternWarnings`: Active pattern warnings
- `streamingMetadata`: Current streaming state
- `currentResponse`: Streaming response in progress
- `isStreaming`: Whether AI is streaming

**Key Actions:**
- `sendMessage(message, commandType?)` - Send message (non-streaming)
- `sendMessageStream(message, commandType?)` - Send message with streaming
- `fetchPatternWarnings()` - Get pattern warnings
- `optimizePortfolio(holdings)` - Request portfolio optimization

**Example:**
```typescript
const { sendMessageStream, currentResponse, isStreaming } = useAiStore(
  useCallback(state => ({
    sendMessageStream: state.sendMessageStream,
    currentResponse: state.currentResponse,
    isStreaming: state.isStreaming,
  }), []),
  useShallow
);
```

### UiStore

Manages UI preferences with persistence. Uses `persist` middleware.

**State:**
- `theme`: Current theme ('dark' | 'light' | 'auto')
- `panelVisibility`: Visibility of each panel
- `devConsoleVisible`: Dev console visibility
- `sidebarCollapsed`: Sidebar state
- `notificationsEnabled`, `soundEnabled`, `animationsEnabled`: User preferences

**Key Actions:**
- `setTheme(theme)` - Change theme
- `togglePanel(panel)` - Toggle panel visibility
- `toggleDevConsole()` - Toggle dev console
- `toggleSidebar()` - Toggle sidebar

**Example:**
```typescript
const theme = useUiStore(state => state.theme);
const toggleSidebar = useUiStore(state => state.toggleSidebar);
```

## Best Practices

### 1. Memoize Selectors

Always memoize selector functions with `useCallback` to prevent "getSnapshot should be cached" warnings:

```typescript
const selector = useCallback(
  (state: ReturnType<typeof useStore.getState>) => ({
    data: state.data,
    action: state.action,
  }),
  []
);
const { data, action } = useStore(selector, useShallow);
```

### 2. Use Shallow Comparison for Objects/Arrays

When selecting multiple fields, always use `useShallow`:

```typescript
// ❌ BAD: Will cause infinite re-renders
const { field1, field2 } = useStore(state => ({ field1: state.field1, field2: state.field2 }));

// ✅ GOOD: Shallow comparison prevents unnecessary re-renders
const selector = useCallback(state => ({ field1: state.field1, field2: state.field2 }), []);
const { field1, field2 } = useStore(selector, useShallow);
```

### 3. Place Hooks at Top Level

Never put hooks inside try-catch or conditional statements:

```typescript
// ❌ BAD: Hook inside try-catch violates React Hook Rules
try {
  const data = useStore(state => state.data);
} catch (error) {
  // ...
}

// ✅ GOOD: Hook at top level, try-catch around usage
const data = useStore(state => state.data);
try {
  // use data
} catch (error) {
  // ...
}
```

### 4. Use Convenience Hooks

Prefer convenience hooks for common selections:

```typescript
// ❌ Less convenient
const balances = useWalletStore(state => 
  state.balances[address] || []
);

// ✅ More convenient
const balances = useWalletBalances(address);
```

### 5. Handle Async Errors

Always handle errors from async actions:

```typescript
const sendTransaction = useWalletStore(state => state.sendTransaction);

try {
  await sendTransaction(input, address);
} catch (error) {
  console.error('Transaction failed:', error);
  // Show error to user
}
```

## Testing

Store tests are located in `tests/stores/`. Each store has comprehensive tests covering:
- State updates
- Async actions
- Optimistic updates
- Error handling
- State reset

Run store tests:
```bash
npm test -- tests/stores/
```

## Type Safety

All stores are fully typed. Import types from `src/types/`:

```typescript
import type { Order, TokenBalance, ChatMessage } from '@/types';
```

## Persistence

Only UI-related stores use persistence:
- `uiStore` - UI preferences
- `themeStore` - Custom themes

All persistence uses Tauri's secure storage via `getPersistentStorage()` helper.
