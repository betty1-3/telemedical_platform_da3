import { useCallback, useEffect, useRef, useState } from 'react';

export interface ResourceState<T> {
  data: T | undefined;
  loading: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * The single async-loading primitive used by every page, so loading / empty /
 * error handling is implemented once instead of per screen.
 */
export function useResource<T>(loader: () => Promise<T>, deps: unknown[] = [], enabled = true): ResourceState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<unknown>(undefined);
  const [nonce, setNonce] = useState(0);

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(undefined);
      setError(undefined);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(undefined);
    loaderRef.
    current().
    then((result) => {
      if (!alive) return;
      setData(result);
      setLoading(false);
    }).
    catch((err: unknown) => {
      if (!alive) return;
      setError(err);
      setData(undefined);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, enabled]);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return { data, loading, error, refetch };
}