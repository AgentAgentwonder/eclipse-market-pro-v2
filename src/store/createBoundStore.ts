import { createStore as createZustandStore, useStore as useZustandStore } from 'zustand';
import type { StoreApi } from 'zustand';

<<<<<<< HEAD
=======
export { shallow as useShallow } from 'zustand/react/shallow';

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
export type CreateStoreResult<T> = {
  store: StoreApi<T>;
  useStore: {
    (): T;
    <U>(selector: (state: T) => U): U;
  };
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
};

export function createBoundStore<T>(
  initializer: (set: any, get: any, api: any) => T
): CreateStoreResult<T> {
  const store = createZustandStore<T>(initializer);
<<<<<<< HEAD
  const useStore = (<U = T>(selector?: (state: T) => U) => {
    return useZustandStore(store, selector as any);
  }) as CreateStoreResult<T>['useStore'];
=======

  const useStore = (<U = T>(selector?: (state: T) => U) => {
    return useZustandStore(store, selector as any);
  }) as CreateStoreResult<T>['useStore'];

>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
  return {
    store,
    useStore,
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
  };
}
<<<<<<< HEAD

/**
 * Simple shallow equality check helper
 * Use this to prevent unnecessary re-renders when selecting multiple values
 * 
 * Usage:
 * const { wallets, loading } = useStore(s => ({ 
 *   wallets: s.wallets, 
 *   loading: s.loading 
 * }));
 */
export function useShallow<T extends Record<string, any>>(selector: (state: any) => T): (state: any) => T {
  let previous: T;
  return (state: any) => {
    const next = selector(state);
    return previous && shallowEqual(previous, next) ? previous : (previous = next);
  };
}

function shallowEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  
  return true;
}
=======
>>>>>>> 07b49b31020889e5570b784e71bee039a7dbb079
