import { useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SkeletonTable } from '@/components/ui/skeleton-table';
import { Metric } from '@/components/ui/metric';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useWalletStore } from '@/store/walletStore';
import { useAiStore } from '@/store/aiStore';
import { useShallow } from 'zustand/react/shallow';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Portfolio() {
  const walletSelector = useCallback(
    (state: ReturnType<typeof useWalletStore.getState>) => ({
      activeAccount: state.activeAccount,
    }),
    []
  );
  const { activeAccount } = useWalletStore(walletSelector, useShallow);

  const portfolioSelector = useCallback(
    (state: ReturnType<typeof usePortfolioStore.getState>) => ({
      positions: state.positions,
      sectorAllocations: state.sectorAllocations,
      concentrationAlerts: state.concentrationAlerts,
      totalValue: state.totalValue,
      totalPnl: state.totalPnl,
      totalPnlPercent: state.totalPnlPercent,
      fetchSectorAllocations: state.fetchSectorAllocations,
      refreshPortfolio: state.refreshPortfolio,
      isLoading: state.isLoading,
      error: state.error,
    }),
    []
  );
  const {
    positions,
    sectorAllocations,
    concentrationAlerts,
    totalValue,
    totalPnl,
    totalPnlPercent,
    fetchSectorAllocations,
    refreshPortfolio,
    isLoading,
    error,
  } = usePortfolioStore(portfolioSelector, useShallow);

  const aiSelector = useCallback(
    (state: ReturnType<typeof useAiStore.getState>) => ({
      optimizePortfolio: state.optimizePortfolio,
      isLoading: state.isLoading,
    }),
    []
  );
  const { optimizePortfolio, isLoading: aiLoading } = useAiStore(aiSelector, useShallow);

  useEffect(() => {
    if (activeAccount) {
      refreshPortfolio(activeAccount.publicKey);
      fetchSectorAllocations(activeAccount.publicKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccount?.publicKey]);

  const handleOptimize = useCallback(async () => {
    if (!activeAccount || positions.length === 0) return;

    const holdings: Record<string, number> = {};
    positions.forEach(pos => {
      holdings[pos.symbol] = pos.amount;
    });

    try {
      const optimization = await optimizePortfolio(holdings);
      alert(
        `Optimization complete!\nRecommendations:\n${optimization.recommendations
          .slice(0, 3)
          .map(r => `- ${r.action}: ${r.symbol} (${r.reason})`)
          .join('\n')}`
      );
    } catch (err) {
      console.error('Failed to optimize portfolio:', err);
    }
  }, [activeAccount, positions, optimizePortfolio]);

  const chartData = useMemo(() => {
    return sectorAllocations.map(sector => ({
      name: sector.sector,
      value: sector.percentage,
      amount: sector.value,
    }));
  }, [sectorAllocations]);

  const pnlChangeType = useMemo(() => {
    if (totalPnl > 0) return 'positive';
    if (totalPnl < 0) return 'negative';
    return 'neutral';
  }, [totalPnl]);

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground mt-1">View and manage your holdings</p>
        </div>
        <Button onClick={handleOptimize} disabled={aiLoading || !activeAccount}>
          <Sparkles className="h-4 w-4 mr-2" />
          {aiLoading ? 'Optimizing...' : 'AI Optimize'}
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Metric
          label="Total Value"
          value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <Metric
          label="Total P&L"
          value={`$${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%`}
          changeType={pnlChangeType}
          isLoading={isLoading}
        />
        <Metric label="Positions" value={positions.length} isLoading={isLoading} />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Concentration Alerts */}
      {concentrationAlerts.length > 0 && (
        <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            <p className="font-medium">Concentration Warnings:</p>
            {concentrationAlerts.map(alert => (
              <p key={alert.id} className="text-sm mt-1">
                • {alert.message}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Holdings Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && positions.length === 0 ? (
              <SkeletonTable rows={5} columns={4} />
            ) : positions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No positions found</p>
                {!activeAccount && (
                  <p className="text-xs mt-2">Connect your wallet to see your portfolio</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Asset</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Amount</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Value</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(position => (
                      <tr
                        key={position.symbol}
                        className="border-b border-border hover:bg-muted/5 transition-colors"
                      >
                        <td className="py-3 text-foreground font-medium">{position.symbol}</td>
                        <td className="text-right text-foreground font-mono">
                          {position.amount.toFixed(6)}
                        </td>
                        <td className="text-right text-foreground">
                          $
                          {position.value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td
                          className={`text-right font-medium ${
                            (position.pnl || 0) >= 0 ? 'text-accent' : 'text-destructive'
                          }`}
                        >
                          ${(position.pnl || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sector Allocation Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && sectorAllocations.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No sector data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={entry => `${entry.name}: ${entry.value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      `$${props.payload.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${value.toFixed(2)}%)`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
