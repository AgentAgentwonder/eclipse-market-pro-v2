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