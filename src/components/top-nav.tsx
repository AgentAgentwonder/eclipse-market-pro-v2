'use client';

import { useState } from 'react';
import CryptoSelector from './crypto-selector';

interface TopNavProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function TopNav({ onToggleSidebar, sidebarOpen }: TopNavProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleLogoClick = () => {
    setIsSpinning(true);
    setTimeout(() => {
      onToggleSidebar();
      setIsSpinning(false);
    }, 300);
  };

  return (
    <div className="h-16 bg-card border-b border-border flex items-center px-6 gap-4">
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Toggle sidebar"
      >
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ${
            isSpinning ? 'eclipse-spin' : ''
          }`}
        >
          <span className="text-xs font-bold text-primary-foreground">E</span>
        </div>
        <span className="font-semibold text-sm text-foreground hidden sm:block">Eclipse</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <CryptoSelector />
      </div>
    </div>
  );
}
