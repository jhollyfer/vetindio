import { useQuery } from '@tanstack/react-query';
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { CircleXIcon } from 'lucide-react';
import type React from 'react';

import { SheetProductCreate } from './-components/sheet-product-create';
import {
  TableProductListPaginated,
  TableProductListSkeleton,
} from './-components/table-product-list-paginated';

import { Pagination } from '@/components/custom/pagination';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { API } from '@/lib/api';
import { QUERY_KEY } from '@/lib/client-query';
import type { Paginated, Product } from '@/lib/entities';
import { MetaDefault } from '@/lib/utils';

export const Route = createFileRoute('/_private/products/')({
  component: RouteComponent,
});

function RouteComponent(): React.JSX.Element {
  const search = useSearch({
    from: '/_private/products/',
  });

  const productListPaginated = useQuery({
    queryKey: [QUERY_KEY.PRODUCT.LIST_PAGINATED, search],
    queryFn: async function () {
      const route = '/products/paginated';
      const response = await API.get<Paginated<Product>>(route);
      return response.data;
    },
  });

  const headers = ['Nome', 'SKU', 'Preço', 'Estoque', 'Descrição'] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 p-2 flex flex-row justify-between gap-1 border-b">
        <h1 className="text-2xl font-medium ">Produtos</h1>
        <SheetProductCreate />
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-auto relative">
        {productListPaginated.status === 'pending' && (
          <TableProductListSkeleton headers={headers} />
        )}
        {productListPaginated.status === 'success' && (
          <TableProductListPaginated
            headers={headers}
            data={productListPaginated.data.data}
          />
        )}
        {productListPaginated.status === 'error' && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleXIcon className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Erro ao carregar produtos</EmptyTitle>
              <EmptyDescription>
                Houve um problema ao carregar os dados. Tente recarregar a
                página.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="shrink-0 border-t p-2">
        <Pagination meta={productListPaginated?.data?.meta ?? MetaDefault} />
      </div>
    </div>
  );
}
