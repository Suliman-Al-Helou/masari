"use client";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/lib/context/ToastContext";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const { Error } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.silent) return; // نقطة هروب
            Error("حدث خطأ", error.message || "حاول مرة أخرى");
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, _vars, _ctx, mutation) => {
            if (mutation.meta?.silent) return;
            Error("فشلت العملية", error.message || "حاول مرة أخرى");
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}