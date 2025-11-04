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
import type { Category, Paginated } from '@/lib/entities';

function CategoryDeleteSkeleton(): React.JSX.Element {
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
          <CardTitle>Slug</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[150px]" />
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryDeleteConfirmation({
  category,
}: {
  category: Category;
}): React.JSX.Element {
  const search = useSearch({
    from: '/_private/categories/',
  });

  const mutationCategoryDelete = useMutation({
    mutationFn: async function () {
      const route = `/categories/${category.id}`;
      await API.delete(route);
    },
    onSuccess() {
      QueryClient.setQueryData<Paginated<Category>>(
        [QUERY_KEY.CATEGORY.LIST_PAGINATED, search],
        (old) => {
          if (!old) return old;

          return {
            meta: {
              ...old.meta,
              total: old.meta.total - 1,
            },
            data: old.data.filter((item) => item.id !== category.id),
          };
        },
      );

      QueryClient.removeQueries({
        queryKey: [QUERY_KEY.CATEGORY.SHOW, category.id],
      });

      toast('Categoria deletada.', {
        className:
          '!bg-destructive !text-destructive-foreground !border-destructive',
        description: 'Categoria removida com sucesso',
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

        // 404 - CATEGORY_NOT_FOUND
        if (data?.code === 404 && data?.cause === 'CATEGORY_NOT_FOUND') {
          toast.error(data?.message ?? 'Categoria não encontrada');
        }

        // 409 - CATEGORY_IN_USE
        if (data?.code === 409 && data?.cause === 'CATEGORY_IN_USE') {
          toast.error(
            data?.message ?? 'Categoria não pode ser deletada pois está em uso',
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
          Deletar categoria
        </AlertDialogTitle>
        <AlertDialogDescription asChild>
          <div className="space-y-3">
            <p>
              Tem certeza que deseja deletar esta categoria? Esta ação não pode
              ser desfeita.
            </p>

            <div className="bg-muted/50 p-3 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Nome:</span>
                <span className="text-sm">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Slug:</span>
                <Badge
                  variant="outline"
                  className="font-mono text-xs"
                >
                  {category.slug}
                </Badge>
              </div>
              {category.description && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium">Descrição:</span>
                  <span className="text-sm text-muted-foreground">
                    {category.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
        // disabled={mutationCategoryDelete.status === 'pending'}
        >
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={async (e) => {
            e.preventDefault();
            await mutationCategoryDelete.mutateAsync();
          }}
          disabled={mutationCategoryDelete.status === 'pending'}
          className="bg-destructive text-primary-foreground hover:bg-destructive/90"
        >
          {mutationCategoryDelete.status === 'pending' && (
            <Spinner className="size-4" />
          )}
          {mutationCategoryDelete.status === 'pending'
            ? 'Deletando...'
            : 'Deletar categoria'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </React.Fragment>
  );
}

interface DialogCategoryDeleteProps
  extends React.ComponentProps<typeof AlertDialogTrigger> {
  categoryId: string;
}

export function DialogCategoryDelete({
  categoryId,
  ...props
}: DialogCategoryDeleteProps): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  const response = useQuery({
    queryKey: [QUERY_KEY.CATEGORY.SHOW, categoryId],
    queryFn: async function () {
      const route = `/categories/${categoryId}`;
      const response = await API.get<Category>(route);
      return response.data;
    },
    enabled: Boolean(open) && Boolean(categoryId),
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
        {response.status === 'pending' && <CategoryDeleteSkeleton />}
        {response.status === 'success' && (
          <CategoryDeleteConfirmation category={response.data} />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
