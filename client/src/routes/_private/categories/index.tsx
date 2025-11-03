import { Pagination } from "@/components/custom/pagination";
import { MetaDefault } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TableCategories } from "./-components/table-categories";

export const Route = createFileRoute("/_private/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const headers = ["Name", "E-mail", "Role", "Status"] as const;

  const pagination = useQuery({
    queryKey: ["categories-paginated"],
    queryFn: async function () {},
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 p-2 flex flex-row justify-between gap-1 border-b">
        <h1 className="text-2xl font-medium ">Categorias</h1>

        {/* <CreateUserSheet /> */}
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-auto relative">
        <TableCategories
          headers={headers}
          // data={pagination.data?.data || []}
          data={[]}
        />
      </div>

      <div className="shrink-0 border-t p-2">
        <Pagination
          // meta={pagination?.data?.meta ?? MetaDefault}
          meta={MetaDefault}
        />
      </div>
    </div>
  );
}
