import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components';
import { AccessibilityProvider } from '@/components/providers/AccessibilityProvider';
import ClientLayout from '@/layouts/ClientLayout';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Trading from '@/pages/Trading';
import AnalyticsPage from '@/pages/analytics/page';
import AIPage from '@/pages/ai/page';
import AIAssistantPage from '@/pages/ai/assistant/page';
import AIPredictionsPage from '@/pages/ai/predictions/page';
import AIRiskPage from '@/pages/ai/risk/page';
import MarketPage from '@/pages/market/page';
import MarketTrendsPage from '@/pages/market/trends/page';
import FreshCoinsPage from '@/pages/market/fresh-coins/page';
import FreshBuyersPage from '@/pages/market/fresh-buyers/page';
import MarketSentimentPage from '@/pages/market/sentiment/page';
import MarketWatchlistPage from '@/pages/market/watchlist/page';
import GovernancePage from '@/pages/governance/page';
import GovernanceProposalsPage from '@/pages/governance/proposals/page';
import GovernanceAlertsPage from '@/pages/governance/alerts/page';
import GovernanceVoicePage from '@/pages/governance/voice/page';
import PortfolioHoldingsPage from '@/pages/portfolio/holdings/page';
import PortfolioPositionsPage from '@/pages/portfolio/positions/page';
import PortfolioPerformancePage from '@/pages/portfolio/performance/page';
import PortfolioHistoryPage from '@/pages/portfolio/history/page';
import PortfolioWalletsPage from '@/pages/portfolio/wallets/page';
import TradingSpotPage from '@/pages/trading/spot/page';
import TradingFuturesPage from '@/pages/trading/futures/page';
import TradingP2PPage from '@/pages/trading/p2p/page';
import TradingPaperPage from '@/pages/trading/paper/page';
import TradingOrderbookPage from '@/pages/trading/orderbook/page';
import LearningPage from '@/pages/learning/page';
import SettingsPage from '@/pages/settings/page';
import WorkspacesPage from '@/pages/workspaces/page';
import CoinDetailPage from '@/pages/coin/[symbol]/page';

function App() {
  return (
    <AppErrorBoundary>
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
                
                {/* Catch-all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ClientLayout>
          </HashRouter>
        </AccessibilityProvider>
    </AppErrorBoundary>
  );
}

export default App;