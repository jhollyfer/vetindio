import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/administrators")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_private/administrators"!</div>;
}
