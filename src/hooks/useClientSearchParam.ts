"use client";

import { useEffect, useState } from "react";

/** Read a query param on the client without `useSearchParams` (avoids Next.js CSR bailout). */
export function useClientSearchParam(name: string): {
  value: string | null;
  ready: boolean;
} {
  const [state, setState] = useState<{ value: string | null; ready: boolean }>({
    value: null,
    ready: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setState({ value: params.get(name), ready: true });
  }, [name]);

  return state;
}

export function useClientSearchParamDefault(
  name: string,
  defaultValue: string
): { value: string; ready: boolean } {
  const { value, ready } = useClientSearchParam(name);
  return { value: value ?? defaultValue, ready };
}
