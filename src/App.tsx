import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';
import ClientLayout from '@/layouts/ClientLayout';
import { APIProvider } from '@/lib/api-context';
import { AppErrorBoundary } from '@/components';
import { ToastContainer } from '@/components';
<<<<<<< HEAD
=======
import { useDevConsoleAutoSetup } from '@/hooks';
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
import { errorLogger } from '@/utils/errorLogger';
import { checkTauriHealth, isTauriEnvironment } from '@/utils/tauriHealthCheck';
import AIAssistantPage from '@/pages/ai/assistant/page';
import AIPage from '@/pages/ai/page';
import AIPredictionsPage from '@/pages/ai/predictions/page';
import AIRiskPage from '@/pages/ai/risk/page';
import AnalyticsPage from '@/pages/analytics/page';
import CoinDetailPage from '@/pages/coin/[symbol]/page';
import DashboardPage from '@/pages/Dashboard';
import GovernanceAlertsPage from '@/pages/governance/alerts/page';
import GovernancePage from '@/pages/governance/page';
import GovernanceProposalsPage from '@/pages/governance/proposals/page';
import GovernanceVoicePage from '@/pages/governance/voice/page';
import LearningPage from '@/pages/learning/page';
import FreshBuyersPage from '@/pages/market/fresh-buyers/page';
import FreshCoinsPage from '@/pages/market/fresh-coins/page';
import MarketPage from '@/pages/market/page';
import MarketSentimentPage from '@/pages/market/sentiment/page';
import MarketTrendsPage from '@/pages/market/trends/page';
import MarketWatchlistPage from '@/pages/market/watchlist/page';
import PortfolioHistoryPage from '@/pages/portfolio/history/page';
import PortfolioHoldingsPage from '@/pages/portfolio/holdings/page';
import PortfolioPage from '@/pages/Portfolio';
import PortfolioPerformancePage from '@/pages/portfolio/performance/page';
import PortfolioPositionsPage from '@/pages/portfolio/positions/page';
import WalletsPage from '@/pages/portfolio/wallets/page';
import SettingsPage from '@/pages/settings/page';
import PaperTradingPage from '@/pages/trading/paper/page';
import TradingPage from '@/pages/Trading';
import TradingFuturesPage from '@/pages/trading/futures/page';
import TradingOrderbookPage from '@/pages/trading/orderbook/page';
import TradingP2PPage from '@/pages/trading/p2p/page';
import TradingSpotPage from '@/pages/trading/spot/page';
import WorkspacesPage from '@/pages/workspaces/page';

interface RouteConfig {
  path: string;
  Component: ComponentType;
}

const ROUTES: RouteConfig[] = [
  { path: '/dashboard', Component: DashboardPage },
  { path: '/analytics', Component: AnalyticsPage },
  { path: '/governance', Component: GovernancePage },
  { path: '/governance/proposals', Component: GovernanceProposalsPage },
  { path: '/governance/alerts', Component: GovernanceAlertsPage },
  { path: '/governance/voice', Component: GovernanceVoicePage },
  { path: '/portfolio', Component: PortfolioPage },
  { path: '/portfolio/holdings', Component: PortfolioHoldingsPage },
  { path: '/portfolio/positions', Component: PortfolioPositionsPage },
  { path: '/portfolio/performance', Component: PortfolioPerformancePage },
  { path: '/portfolio/history', Component: PortfolioHistoryPage },
  { path: '/portfolio/wallets', Component: WalletsPage },
  { path: '/workspaces', Component: WorkspacesPage },
  { path: '/trading', Component: TradingPage },
  { path: '/trading/spot', Component: TradingSpotPage },
  { path: '/trading/futures', Component: TradingFuturesPage },
  { path: '/trading/p2p', Component: TradingP2PPage },
  { path: '/trading/paper', Component: PaperTradingPage },
  { path: '/trading/orderbook', Component: TradingOrderbookPage },
  { path: '/learning', Component: LearningPage },
  { path: '/ai', Component: AIPage },
  { path: '/ai/predictions', Component: AIPredictionsPage },
  { path: '/ai/assistant', Component: AIAssistantPage },
  { path: '/ai/risk', Component: AIRiskPage },
  { path: '/market', Component: MarketPage },
  { path: '/market/trends', Component: MarketTrendsPage },
  { path: '/market/fresh-coins', Component: FreshCoinsPage },
  { path: '/market/fresh-buyers', Component: FreshBuyersPage },
  { path: '/market/sentiment', Component: MarketSentimentPage },
  { path: '/market/watchlist', Component: MarketWatchlistPage },
  { path: '/coin/:symbol', Component: CoinDetailPage },
  { path: '/settings', Component: SettingsPage },
];

<<<<<<< HEAD
/**
 * Inner component that uses hooks (must be inside providers)
 */
function AppContent() {
=======
function App() {
  // Set up dev console keyboard shortcuts automatically
  useDevConsoleAutoSetup();

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  // Log app initialization and check Tauri health
  useEffect(() => {
    errorLogger.info('App component mounted and rendering', 'App.tsx');
    
    // Check if running in Tauri environment
    if (isTauriEnvironment()) {
      errorLogger.info('Running in Tauri environment', 'App.tsx');
      
      // Check Tauri backend health
<<<<<<< HEAD
      checkTauriHealth()
        .then(health => {
          if (health) {
            errorLogger.info(
              `Tauri backend connected successfully (v${health.version})`,
              'App.tsx',
              { health }
            );
          } else {
            errorLogger.warning(
              'Tauri backend not responding - some features may be unavailable',
              'App.tsx'
            );
          }
        })
        .catch(error => {
          errorLogger.error(
            'Failed to check Tauri health',
            'App.tsx',
            error instanceof Error ? error : undefined
          );
        });
=======
      checkTauriHealth().then(health => {
        if (health) {
          errorLogger.info(
            `Tauri backend connected successfully (v${health.version})`,
            'App.tsx',
            { health }
          );
        } else {
          errorLogger.warning(
            'Tauri backend not responding - some features may be unavailable',
            'App.tsx'
          );
        }
      }).catch(error => {
        errorLogger.error(
          'Failed to check Tauri health',
          'App.tsx',
          error instanceof Error ? error : undefined
        );
      });
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    } else {
      errorLogger.info('Running in browser environment (not Tauri)', 'App.tsx');
    }
    
    return () => {
      errorLogger.info('App component unmounting', 'App.tsx');
    };
  }, []);

  return (
<<<<<<< HEAD
    <HashRouter>
      <ClientLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {ROUTES.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ClientLayout>
    </HashRouter>
  );
}

function App() {
  return (
=======
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    <AppErrorBoundary
      onError={(error, errorInfo) => {
        errorLogger.error('Unhandled error in App', 'App.tsx', error, {
          componentStack: errorInfo.componentStack,
        });
        console.error('Global error caught:', error, errorInfo);
<<<<<<< HEAD
=======
        // In production, you might want to send this to an error reporting service
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
      }}
    >
      <APIProvider>
        <AccessibilityProvider>
<<<<<<< HEAD
          <AppContent />
=======
          <HashRouter>
            <ClientLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                {ROUTES.map(({ path, Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ClientLayout>
          </HashRouter>
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
          <ToastContainer />
        </AccessibilityProvider>
      </APIProvider>
    </AppErrorBoundary>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
