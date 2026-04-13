"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          removeDelay: 1000,
          duration: 2000,
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ message }) =>
              t.type !== "loading" && (
                <button
                  className="cursor-pointer"
                  onClick={() => toast.dismiss(t.id)}
                >
                  {message}
                </button>
              )
            }
          </ToastBar>
        )}
      </Toaster>
      ; ;
    </QueryClientProvider>
  );
}
