import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/app/router";
import { useUIStore, resolveTheme } from "@/stores/ui.store";
import { ToastHost } from "@/components/common/crud";
import { setActiveCurrency } from "@/utils/format";
import { Button } from "@/components/ui/primitives";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
});

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error("[Nexora ERP] Unhandled error:", error);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
          <p className="text-5xl font-black">500</p>
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            An unexpected error interrupted this view. Your data is safe — try reloading, or return to the dashboard.
          </p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button variant="outline" onClick={() => { this.setState({ error: null }); window.location.hash = "#/dashboard"; }}>
              Go to dashboard
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ThemeSync() {
  const theme = useUIStore((s) => s.theme);
  const locale = useUIStore((s) => s.locale);
  const currency = useUIStore((s) => s.currency);

  React.useEffect(() => {
    const resolved = resolveTheme(theme);
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
  }, [theme]);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  React.useEffect(() => {
    setActiveCurrency(currency);
  }, [currency]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeSync />
        <RouterProvider router={router} />
        <ToastHost />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
