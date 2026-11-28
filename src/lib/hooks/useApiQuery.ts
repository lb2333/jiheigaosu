'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const MAX_CACHE_ENTRIES = 80;
const DEFAULT_STALE_TIME_MS = 15_000;
const queryCache = new Map<string, CacheEntry<unknown>>();

function writeCache<T>(url: string, data: T): void {
  if (queryCache.has(url)) {
    queryCache.delete(url);
  } else if (queryCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = queryCache.keys().next().value;
    if (oldestKey !== undefined) {
      queryCache.delete(oldestKey);
    }
  }
  queryCache.set(url, { data, ts: Date.now() });
}

/** Clear cached entries globally or matching a URL prefix after mutations. */
export function invalidateApiCache(prefix?: string): void {
  if (!prefix) {
    queryCache.clear();
    return;
  }
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }
}

export interface UseApiQueryOptions {
  enabled?: boolean;
  staleTimeMs?: number;
}

export interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: (opts?: { force?: boolean }) => Promise<T | null>;
}

/**
 * Lightweight zero-dependency fetch hook with AbortController race protection
 * and bounded in-memory stale-while-revalidate caching.
 */
export function useApiQuery<T>(
  url: string | null,
  options?: UseApiQueryOptions
): UseApiQueryResult<T> {
  const enabled = options?.enabled ?? true;
  const staleTimeMs = options?.staleTimeMs ?? DEFAULT_STALE_TIME_MS;

  const initialCached =
    enabled && url ? (queryCache.get(url) as CacheEntry<T> | undefined) : undefined;

  const [data, setData] = useState<T | null>(() => initialCached?.data ?? null);
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(enabled && url && !initialCached)
  );
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const latestUrlRef = useRef<string | null>(url);
  latestUrlRef.current = url;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const executeFetch = useCallback(
    async (targetUrl: string, showLoading: boolean): Promise<T | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (showLoading && mountedRef.current) {
        setLoading(true);
      }
      if (mountedRef.current) {
        setError(null);
      }

      try {
        const res = await fetch(targetUrl, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as T;
        writeCache(targetUrl, json);
        if (mountedRef.current && latestUrlRef.current === targetUrl) {
          setData(json);
          setError(null);
          setLoading(false);
        }
        return json;
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') {
          return null;
        }
        if (mountedRef.current && latestUrlRef.current === targetUrl) {
          setError(err instanceof Error ? err : new Error('Request failed'));
          setLoading(false);
        }
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled || !url) {
      abortRef.current?.abort();
      setLoading(false);
      return;
    }

    const cached = queryCache.get(url) as CacheEntry<T> | undefined;
    if (cached) {
      setData(cached.data);
      setLoading(false);
      setError(null);
      if (Date.now() - cached.ts < staleTimeMs) {
        return;
      }
      void executeFetch(url, false);
      return;
    }

    void executeFetch(url, true);

    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, url, staleTimeMs, executeFetch]);

  const refetch = useCallback(
    async (opts?: { force?: boolean }): Promise<T | null> => {
      const targetUrl = latestUrlRef.current;
      if (!enabled || !targetUrl) return null;
      const force = opts?.force ?? true;
      const cached = queryCache.get(targetUrl) as CacheEntry<T> | undefined;
      if (!force && cached && Date.now() - cached.ts < staleTimeMs) {
        setData(cached.data);
        setLoading(false);
        return cached.data;
      }
      return executeFetch(targetUrl, !cached);
    },
    [enabled, staleTimeMs, executeFetch]
  );

  return { data, loading, error, refetch };
}
