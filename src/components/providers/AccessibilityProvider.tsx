import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { useAccessibilityStore, type AccessibilityState } from '@/store/accessibilityStore';
import { useShallow } from 'zustand/react/shallow';
import { errorLogger } from '@/utils/errorLogger';

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const selector = useCallback(
    (state: AccessibilityState) => ({
      fontScale: state.fontScale,
      highContrastMode: state.highContrastMode,
      reducedMotion: state.reducedMotion,
    }),
    []
  );

  const { fontScale, highContrastMode, reducedMotion } = useAccessibilityStore(
    useShallow(selector)
  );

  useEffect(() => {
    errorLogger.info('AccessibilityProvider: Initializing', 'AccessibilityProvider');
    return () => {
      errorLogger.info('AccessibilityProvider: Cleaning up', 'AccessibilityProvider');
    };
  }, []);

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--font-scale', fontScale.toString());
      root.style.fontSize = `${16 * fontScale}px`;
      errorLogger.info(`Font scale set to ${fontScale}`, 'AccessibilityProvider');
    } catch (error) {
      errorLogger.error(
        `Failed to set font scale to ${fontScale}`,
        'AccessibilityProvider',
        error instanceof Error ? error : undefined
      );
    }
  }, [fontScale]);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('high-contrast', highContrastMode);
      errorLogger.info(
        `High contrast mode ${highContrastMode ? 'enabled' : 'disabled'}`,
        'AccessibilityProvider'
      );
    } catch (error) {
      errorLogger.error(
        'Failed to toggle high contrast mode',
        'AccessibilityProvider',
        error instanceof Error ? error : undefined
      );
    }
  }, [highContrastMode]);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('reduced-motion', reducedMotion);
      errorLogger.info(
        `Reduced motion ${reducedMotion ? 'enabled' : 'disabled'}`,
        'AccessibilityProvider'
      );
    } catch (error) {
      errorLogger.error(
        'Failed to toggle reduced motion',
        'AccessibilityProvider',
        error instanceof Error ? error : undefined
      );
    }
  }, [reducedMotion]);

  return <>{children}</>;
}
