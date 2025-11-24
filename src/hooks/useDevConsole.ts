import React, { useCallback, useState, useEffect } from 'react';
<<<<<<< HEAD
import { useUiStore } from '../store/uiStore';

let appWindowCache: any = null;

/**
 * Initialize Tauri window safely
 */
function initializeTauriWindow() {
  if (appWindowCache) return appWindowCache;

  try {
    // Only import if we're in a Tauri context
    const { getCurrentWindow } = require('@tauri-apps/api/window');
    
    if (typeof getCurrentWindow === 'function') {
      // getCurrentWindow is synchronous in Tauri
      appWindowCache = getCurrentWindow();
      return appWindowCache;
    }
  } catch (error) {
    console.debug('[useDevConsole] Tauri not available:', error);
  }

  return null;
}

/**
 * Hook for managing developer console functionality
 * Integrates with Zustand uiStore for state persistence
 */
export function useDevConsole() {
  const devConsoleOpen = useUiStore(state => state.devConsoleOpen);
  const setDevConsoleOpen = useUiStore(state => state.setDevConsoleOpen);
  const [appWindow, setAppWindow] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize Tauri window once
  useEffect(() => {
    if (initialized) return;

    try {
      const window = initializeTauriWindow();
      if (window) {
        setAppWindow(window);
      }
    } catch (error) {
      console.warn('[useDevConsole] Failed to initialize Tauri window:', error);
    } finally {
      setInitialized(true);
    }
  }, []); // Empty deps - run once

  const toggleDevConsole = useCallback(async () => {
=======
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useUIStore } from '../store/uiStore';

/**
 * Hook for managing developer console functionality
 * Only works in development builds (when __DEV__ is true)
 */
export function useDevConsole() {
  const { devConsoleOpen, setDevConsoleOpen } = useUIStore();
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    getCurrentWindow().then(setAppWindow);
  }, []);

  const toggleDevConsole = useCallback(async () => {
    // Only allow in development builds
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Dev console is only available in development builds');
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    if (!appWindow) return;

    try {
      if (devConsoleOpen) {
<<<<<<< HEAD
        await appWindow.closeDevtools();
        setDevConsoleOpen(false);
      } else {
=======
        // Close devtools
        await appWindow.closeDevtools();
        setDevConsoleOpen(false);
      } else {
        // Open devtools
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
        await appWindow.openDevtools();
        setDevConsoleOpen(true);
      }
    } catch (error) {
      console.error('Failed to toggle dev console:', error);
    }
  }, [devConsoleOpen, setDevConsoleOpen, appWindow]);

  const openDevConsole = useCallback(async () => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Dev console is only available in development builds');
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    if (!appWindow) return;

    try {
      if (!devConsoleOpen) {
        await appWindow.openDevtools();
        setDevConsoleOpen(true);
      }
    } catch (error) {
      console.error('Failed to open dev console:', error);
    }
  }, [devConsoleOpen, setDevConsoleOpen, appWindow]);

  const closeDevConsole = useCallback(async () => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    if (!appWindow) return;

    try {
      if (devConsoleOpen) {
        await appWindow.closeDevtools();
        setDevConsoleOpen(false);
      }
    } catch (error) {
      console.error('Failed to close dev console:', error);
    }
  }, [devConsoleOpen, setDevConsoleOpen, appWindow]);

  return {
    isDevConsoleOpen: devConsoleOpen,
    toggleDevConsole,
    openDevConsole,
    closeDevConsole,
<<<<<<< HEAD
=======
    // Convenience method to check if dev console is available
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    isDevConsoleAvailable: process.env.NODE_ENV === 'development',
  };
}

/**
 * Hook for keyboard shortcuts related to dev console
 */
export function useDevConsoleShortcuts() {
  const { toggleDevConsole, isDevConsoleAvailable } = useDevConsole();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // F12 or Ctrl+Shift+I (Cmd+Opt+I on Mac) to toggle dev console
      if (
        isDevConsoleAvailable &&
        (event.key === 'F12' ||
          (event.ctrlKey && event.shiftKey && event.key === 'I') ||
          (event.metaKey && event.altKey && event.key === 'I'))
      ) {
        event.preventDefault();
        toggleDevConsole();
      }
    },
    [isDevConsoleAvailable, toggleDevConsole]
  );

  return {
    handleKeyDown,
  };
}

/**
 * Hook that automatically sets up dev console keyboard shortcuts
 */
export function useDevConsoleAutoSetup() {
  const { handleKeyDown } = useDevConsoleShortcuts();

  // Set up keyboard event listener
  React.useEffect(() => {
<<<<<<< HEAD
    if (process.env.NODE_ENV !== 'development') {
      return; // Skip in production
    }
    
=======
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
<<<<<<< HEAD
}
=======
}
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
