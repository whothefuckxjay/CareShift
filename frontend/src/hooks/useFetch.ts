import { useCallback, useEffect, useState } from "react";

type State<T> =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({ status: "loading" });

  const run = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetcher();
      setState({ status: "success", data });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ??
        err?.message ??
        "Something went wrong. Check the backend is running.";
      setState({ status: "error", error: msg });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { ...state, refetch: run };
}
