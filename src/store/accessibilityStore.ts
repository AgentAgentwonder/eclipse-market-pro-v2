import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getPersistentStorage } from './storage';

const DEFAULTS = {
  fontScale: 1,
  highContrastMode: false,
  reducedMotion: false,
  screenReaderOptimizations: false,
  keyboardNavigationHints: false,
  focusIndicatorEnhanced: false,
} as const;

export interface AccessibilityState {
  fontScale: number;
  highContrastMode: boolean;
  reducedMotion: boolean;
  screenReaderOptimizations: boolean;
  keyboardNavigationHints: boolean;
  focusIndicatorEnhanced: boolean;
  setFontScale: (value: number) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleScreenReaderOptimizations: () => void;
  toggleKeyboardNavigationHints: () => void;
  toggleFocusIndicatorEnhanced: () => void;
  resetToDefaults: () => void;
}

const clampFontScale = (value: number) => {
  if (!Number.isFinite(value)) {
    return DEFAULTS.fontScale;
  }

  return Math.min(2, Math.max(1, value));
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    set => ({
      ...DEFAULTS,
      setFontScale: value => set(() => ({ fontScale: clampFontScale(value) })),
      toggleHighContrast: () => set(state => ({ highContrastMode: !state.highContrastMode })),
      toggleReducedMotion: () => set(state => ({ reducedMotion: !state.reducedMotion })),
      toggleScreenReaderOptimizations: () =>
        set(state => ({ screenReaderOptimizations: !state.screenReaderOptimizations })),
      toggleKeyboardNavigationHints: () =>
        set(state => ({ keyboardNavigationHints: !state.keyboardNavigationHints })),
      toggleFocusIndicatorEnhanced: () =>
        set(state => ({ focusIndicatorEnhanced: !state.focusIndicatorEnhanced })),
      resetToDefaults: () => set(() => ({ ...DEFAULTS })),
    }),
    {
      name: 'eclipse-accessibility-store',
      storage: createJSONStorage(getPersistentStorage),
    }
  )
);
