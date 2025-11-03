import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient } from "./lib/client-query";
import { routeTree } from "./lib/route-tree.gen";

const router = createRouter({
  routeTree,
  context: {
    QueryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={QueryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
      <Toaster />
    </TooltipProvider>
  );
}
