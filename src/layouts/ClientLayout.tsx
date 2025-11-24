import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import TopNav from '@/components/top-nav';
import { useAPIKeys } from '@/lib/api-context';
import { useThemeStore, type ThemeStoreState } from '@/store/themeStore';
import { useShallow } from 'zustand/react/shallow';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { apiKeys } = useAPIKeys();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const themeSelector = useCallback(
    (state: ThemeStoreState) => ({
      activeThemeId: state.activeThemeId,
      setActiveTheme: state.setActiveTheme,
    }),
    []
  );

  const { activeThemeId, setActiveTheme } = useThemeStore(useShallow(themeSelector));

  useEffect(() => {
    setActiveTheme(apiKeys?.theme ?? 'eclipse');
  }, [apiKeys?.theme, setActiveTheme]);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', activeThemeId);
    htmlElement.classList.add('dark');
  }, [activeThemeId]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(prev => !prev)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto fade-in">{children}</main>
      </div>
    </div>
  );
}
