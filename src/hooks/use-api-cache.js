import { useState, useEffect, useRef, useCallback } from 'react';
/**
 * Custom hook for caching API responses and preventing redundant calls
 */
export function useApiCache(key, fetcher, dependencies = [], options = {}) {
    const { cacheTime = 5 * 60 * 1000, staleTime = 60 * 1000 } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cacheRef = useRef(new Map());
    const fetchingRef = useRef(new Map());
    const fetchData = useCallback(async () => {
        const now = Date.now();
        const cached = cacheRef.current.get(key);
        // Return cached data if it's still fresh
        if (cached && (now - cached.timestamp) < cacheTime) {
            setData(cached.data);
            setLoading(false);
            setError(null);
            // If data is stale but still cached, fetch in background
            if ((now - cached.timestamp) > staleTime) {
                // Background refresh without changing loading state
                fetcher().then(result => {
                    cacheRef.current.set(key, {
                        data: result,
                        timestamp: now,
                        loading: false
                    });
                    setData(result);
                }).catch(() => {
                    // Silently fail background refresh
                });
            }
            return cached.data;
        }
        // Check if we're already fetching this key
        const existingFetch = fetchingRef.current.get(key);
        if (existingFetch) {
            try {
                const result = await existingFetch;
                setData(result);
                setLoading(false);
                setError(null);
                return result;
            }
            catch (err) {
                setError(err);
                setLoading(false);
                throw err;
            }
        }
        // Start new fetch
        setLoading(true);
        setError(null);
        const fetchPromise = fetcher();
        fetchingRef.current.set(key, fetchPromise);
        try {
            const result = await fetchPromise;
            // Cache the result
            cacheRef.current.set(key, {
                data: result,
                timestamp: now,
                loading: false
            });
            setData(result);
            setLoading(false);
            return result;
        }
        catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
        finally {
            fetchingRef.current.delete(key);
        }
    }, [key, fetcher, cacheTime]);
    const invalidateCache = useCallback(() => {
        cacheRef.current.delete(key);
        fetchingRef.current.delete(key);
    }, [key]);
    const refetch = useCallback(() => {
        invalidateCache();
        return fetchData();
    }, [invalidateCache, fetchData]);
    useEffect(() => {
        fetchData().catch(() => {
            // Error is already handled in fetchData
        });
    }, dependencies);
    // Clean up old cache entries periodically
    useEffect(() => {
        const cleanup = () => {
            const now = Date.now();
            for (const [cacheKey, entry] of cacheRef.current.entries()) {
                if (now - entry.timestamp > cacheTime) {
                    cacheRef.current.delete(cacheKey);
                }
            }
        };
        const interval = setInterval(cleanup, cacheTime);
        return () => clearInterval(interval);
    }, [cacheTime]);
    return {
        data,
        loading,
        error,
        refetch,
        invalidateCache
    };
}
