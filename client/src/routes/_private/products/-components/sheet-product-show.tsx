import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangleIcon } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { API } from '@/lib/api';
import { QUERY_KEY } from '@/lib/client-query';
import type { Product } from '@/lib/entities';
import { cn } from '@/lib/utils';

function ProductDetailSkeleton(): React.JSX.Element {
  return (
    <section className="space-y-4 mt-4">
      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Nome</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[200px]" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>SKU</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[150px]" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Preço</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[100px]" />
        </CardContent>
      </Card>
    </section>
  );
}

function ProductDetailError(): React.JSX.Element {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>Erro ao carregar produto</EmptyTitle>
        <EmptyDescription>
          Não foi possível carregar os dados do produto. Tente novamente.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function ProductDetail({ product }: { product: Product }): React.JSX.Element {
  return (
    <section className="space-y-4 mt-4">
      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Nome</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm">{product.name}</p>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>SKU</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Badge variant="outline" className="font-mono text-xs">
            {product.sku}
          </Badge>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Preço</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm font-medium">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(product.price / 100)}
          </p>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Estoque</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
              product.stock > 10
                ? 'bg-green-50 text-green-700'
                : product.stock > 0
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700',
            )}
          >
            {product.stock} unidades
          </span>
        </CardContent>
      </Card>

      {product.description && (
        <Card className="py-4 px-3 shadow-none gap-2">
          <CardHeader className="p-0">
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Criado em</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm text-muted-foreground">
            {format(new Date(product.createdAt), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Atualizado em</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-sm text-muted-foreground">
            {format(new Date(product.updatedAt), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

interface SheetProductShowProps
  extends React.ComponentProps<typeof SheetTrigger> {
  productId: string;
}

export const SheetProductShow = React.forwardRef<
  HTMLButtonElement,
  SheetProductShowProps
>(function SheetProductShow({ productId, children, ...props }, ref) {
  const [open, setOpen] = React.useState(false);

  const response = useQuery({
    queryKey: [QUERY_KEY.PRODUCT.SHOW, productId],
    queryFn: async function () {
      const route = `/products/${productId}`;
      const response = await API.get<Product>(route);
      return response.data;
    },
    enabled: Boolean(open) && Boolean(productId),
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="hidden" ref={ref} {...props}>
        {children}
      </SheetTrigger>
      <SheetContent className="flex flex-col py-4 px-6 gap-5 sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="px-0">
          <SheetTitle className="text-lg font-medium">
            Visualizar produto
          </SheetTitle>
          <SheetDescription>Informações detalhadas do produto</SheetDescription>
        </SheetHeader>

        {response.status === 'pending' && <ProductDetailSkeleton />}
        {response.status === 'error' && <ProductDetailError />}
        {response.status === 'success' && <ProductDetail product={response.data} />}
      </SheetContent>
    </Sheet>
  );
});