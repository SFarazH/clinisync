"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
// import toast, { ToastBar, Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        toastOptions={{ className: "text-red" }}
        position="bottom-right"
        duration={2000}
        visibleToasts={3}
      />
    </QueryClientProvider>
  );
}
