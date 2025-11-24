'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaperTradingPage() {
  return (
    <div className="p-6 space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paper Trading</h1>
        <p className="text-muted-foreground mt-1">Practice trading with virtual funds</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Practice Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/10 rounded p-4">
                <p className="text-xs text-muted-foreground">Virtual Balance</p>
                <p className="text-2xl font-bold text-accent mt-1">$10,000.00</p>
              </div>
              <div className="bg-muted/10 rounded p-4">
                <p className="text-xs text-muted-foreground">P&L</p>
                <p className="text-2xl font-bold text-accent mt-1">$0.00</p>
              </div>
            </div>
            <div className="h-64 bg-muted/10 rounded flex items-center justify-center border border-border">
              <p className="text-muted-foreground">
                Paper trading interface will be integrated here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
