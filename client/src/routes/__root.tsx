import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <Outlet />
    </>
  ),
  head: () => ({
    meta: [
      {
        name: "description",
        content: "VetShop - Plataforma oficial",
      },
      {
        title: "VetShop - Plataforma oficial",
      },
    ],
  }),
});
