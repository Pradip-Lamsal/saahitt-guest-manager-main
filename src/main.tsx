import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { PlanStateProvider } from "@/hooks/useGlobalPlanState";
import { initializeSecurity } from "@/utils/securityConfig";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Initialize security before anything else
initializeSecurity();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 0,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PlanStateProvider>
          <App />
          <Toaster />
          <Sonner />
        </PlanStateProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
