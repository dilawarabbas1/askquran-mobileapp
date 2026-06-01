import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Lightweight cross-screen search bus. Reference chips on the Facts / content
 * screens call `requestSearch(query)`; navigation switches to the Search tab and
 * the Search screen consumes the pending query. Mirrors the web's `/?q=` deep
 * link, which pre-fills and runs a search.
 */
interface SearchBusValue {
  pending: { query: string; nonce: number } | null;
  requestSearch: (query: string) => void;
  consume: () => string | null;
  setNavigateToSearch: (fn: () => void) => void;
}

const SearchBusContext = createContext<SearchBusValue | null>(null);

export function SearchBusProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<{ query: string; nonce: number } | null>(null);
  const navRef = useRef<(() => void) | null>(null);

  const setNavigateToSearch = useCallback((fn: () => void) => {
    navRef.current = fn;
  }, []);

  const requestSearch = useCallback((query: string) => {
    setPending({ query, nonce: Date.now() });
    navRef.current?.();
  }, []);

  const consume = useCallback(() => {
    const q = pending?.query ?? null;
    setPending(null);
    return q;
  }, [pending]);

  const value = useMemo<SearchBusValue>(
    () => ({ pending, requestSearch, consume, setNavigateToSearch }),
    [pending, requestSearch, consume, setNavigateToSearch],
  );
  return <SearchBusContext.Provider value={value}>{children}</SearchBusContext.Provider>;
}

export function useSearchBus(): SearchBusValue {
  const ctx = useContext(SearchBusContext);
  if (!ctx) throw new Error("useSearchBus must be used within <SearchBusProvider>");
  return ctx;
}
