import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { Trash2Icon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { API } from '@/lib/api';
import { QUERY_KEY, QueryClient } from '@/lib/client-query';
import type { Paginated, Product } from '@/lib/entities';

function ProductDeleteSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
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
    </div>
  );
}

function ProductDeleteConfirmation({
  product,
}: {
  product: Product;
}): React.JSX.Element {
  const search = useSearch({
    from: '/_private/products/',
  });

  const mutationProductDelete = useMutation({
    mutationFn: async function () {
      const route = `/products/${product.id}`;
      await API.delete(route);
    },
    onSuccess() {
      QueryClient.setQueryData<Paginated<Product>>(
        [QUERY_KEY.PRODUCT.LIST_PAGINATED, search],
        (old) => {
          if (!old) return old;

          return {
            meta: {
              ...old.meta,
              total: old.meta.total - 1,
            },
            data: old.data.filter((item) => item.id !== product.id),
          };
        },
      );

      QueryClient.removeQueries({
        queryKey: [QUERY_KEY.PRODUCT.SHOW, product.id],
      });

      toast('Produto deletado.', {
        className:
          '!bg-destructive !text-destructive-foreground !border-destructive',
        description: 'Produto removido com sucesso',
        descriptionClassName: '!text-destructive-foreground',
        closeButton: true,
      });
    },
    onError(error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;

        // 400 - INVALID_PARAMETERS
        if (data?.code === 400 && data?.cause === 'INVALID_PARAMETERS') {
          toast.error(data?.message ?? 'Parâmetros inválidos');
        }

        // 401 - AUTHENTICATION_REQUIRED
        if (data?.code === 401 && data?.cause === 'AUTHENTICATION_REQUIRED') {
          toast.error(data?.message ?? 'Autenticação necessária');
        }

        // 403 - ACCESS_DENIED
        if (data?.code === 403 && data?.cause === 'ACCESS_DENIED') {
          toast.error(data?.message ?? 'Acesso negado');
        }

        // 404 - PRODUCT_NOT_FOUND
        if (data?.code === 404 && data?.cause === 'PRODUCT_NOT_FOUND') {
          toast.error(data?.message ?? 'Produto não encontrado');
        }

        // 409 - PRODUCT_IN_USE
        if (data?.code === 409 && data?.cause === 'PRODUCT_IN_USE') {
          toast.error(
            data?.message ?? 'Produto não pode ser deletado pois está em uso',
          );
        }

        // 500 - SERVER_ERROR
        if (data?.code === 500) {
          toast.error(data?.message ?? 'Erro interno do servidor');
        }
      }

      console.error(error);
    },
  });

  return (
    <React.Fragment>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <Trash2Icon className="size-5 text-destructive" />
          Deletar produto
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-3">
            <p>
              Tem certeza que deseja deletar este produto? Esta ação não pode
              ser desfeita.
            </p>

            <div className="bg-muted/50 p-3 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Nome:</span>
                <span className="text-sm">{product.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">SKU:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs"
                >
                  {product.sku}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Preço:</span>
                <span className="text-sm">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(product.price / 100)}
                </span>
              </div>
              {product.description && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium">Descrição:</span>
                  <span className="text-sm text-muted-foreground">
                    {product.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={async (e) => {
            e.preventDefault();
            await mutationProductDelete.mutateAsync();
          }}
          disabled={mutationProductDelete.status === 'pending'}
          className="bg-destructive text-primary-foreground hover:bg-destructive/90"
        >
          {mutationProductDelete.status === 'pending' && (
            <Spinner className="size-4" />
          )}
          {mutationProductDelete.status === 'pending'
            ? 'Deletando...'
            : 'Deletar produto'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </React.Fragment>
  );
}

interface DialogProductDeleteProps
  extends React.ComponentProps<typeof AlertDialogTrigger> {
  productId: string;
}

export function DialogProductDelete({
  productId,
  ...props
}: DialogProductDeleteProps): React.JSX.Element {
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
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger
        className="hidden"
        {...props}
      />
      <AlertDialogContent className="sm:max-w-lg">
        {response.status === 'pending' && <ProductDeleteSkeleton />}
        {response.status === 'success' && (
          <ProductDeleteConfirmation product={response.data} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
