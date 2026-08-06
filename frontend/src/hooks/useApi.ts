import { useCallback, useEffect, useRef, useState } from "react";
import { apiErrorMessage } from "@/api/client";

type State<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: T }
  | { status: "error"; message: string };

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): {
  state: State<T>;
  refresh: () => void;
  setData: (data: T) => void;
} {
  const [state, setState] = useState<State<T>>({ status: "loading" });
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      if (mountedRef.current) setState({ status: "ok", data });
    } catch (err) {
      if (mountedRef.current)
        setState({ status: "error", message: apiErrorMessage(err) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => { mountedRef.current = false; };
  }, [run]);

  const refresh = useCallback(() => run(), [run]);
  const setData = useCallback(
    (data: T) => setState({ status: "ok", data }),
    []
  );

  return { state, refresh, setData };
}
