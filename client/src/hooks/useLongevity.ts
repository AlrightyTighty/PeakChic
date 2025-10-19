import { useEffect, useState } from "react";
import { fetchLongevity } from "../api/longevity";
import type { LongevityInput, LongevityResponse } from "../types/Longevity";

export function useLongevity(input: LongevityInput | null) {
  const [data, setData] = useState<LongevityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!input) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchLongevity(input);
        if (alive) setData(res);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "error");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => { alive = false; };
  }, [JSON.stringify(input)]);

  return { data, loading, error };
}
