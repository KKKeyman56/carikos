"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Client-only providers mounted in the root layout, so the layout itself
// stays a Server Component.
export function Providers({ children }: { children: ReactNode }) {
  // The useState initializer guarantees one stable QueryClient per browser
  // session; it is never recreated on rerender so the cache is not lost.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Sensible defaults for a search-heavy app; per-query overrides
            // belong next to the API functions in src/lib/api/.
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
