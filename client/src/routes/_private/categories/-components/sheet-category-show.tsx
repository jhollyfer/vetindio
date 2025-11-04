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
import type { Category } from '@/lib/entities';
import { cn } from '@/lib/utils';

function CategoryDetailSkeleton(): React.JSX.Element {
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
          <CardTitle>Slug</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[150px]" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[300px]" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-5 w-full max-w-[100px]" />
        </CardContent>
      </Card>
    </section>
  );
}

function CategoryDetail({
  category,
}: {
  category: Category;
}): React.JSX.Element {
  return (
    <section className="space-y-4">
      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Nome</CardTitle>
        </CardHeader>
        <CardContent className="p-0">{category.name}</CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Slug</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Badge
            variant="outline"
            className="font-mono text-xs"
          >
            {category.slug}
          </Badge>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {category.description || (
            <span className="text-muted-foreground italic">
              Nenhuma descrição fornecida
            </span>
          )}
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Badge
            variant="outline"
            className={cn(
              'font-semibold border-transparent',
              category.status === 'ACTIVE' && 'bg-green-100 text-green-700',
              category.status === 'INACTIVE' && 'bg-red-100 text-red-700',
            )}
          >
            {category.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
          </Badge>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Criado em</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <span className="text-sm font-mono">
            {format(category.createdAt, 'dd/MM/yyyy')}
          </span>
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Atualizado em</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <span className="text-sm font-mono">
            {format(category.updatedAt, 'dd/MM/yyyy')}
          </span>
        </CardContent>
      </Card>
    </section>
  );
}

interface SheetCategoryShowProps
  extends React.ComponentProps<typeof SheetTrigger> {
  categoryId: string;
}

export function SheetCategoryShow({
  categoryId,
  ...props
}: SheetCategoryShowProps): React.JSX.Element {
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
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger
        className="hidden"
        {...props}
      />
      <SheetContent className="flex flex-col py-4 px-6 gap-5 sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="px-0">
          <SheetTitle className="text-lg font-medium">
            Detalhes da Categoria
          </SheetTitle>
          <SheetDescription>
            Visualize os detalhes da categoria selecionada
          </SheetDescription>
        </SheetHeader>
        {response.status === 'pending' && <CategoryDetailSkeleton />}
        {response.status === 'success' && (
          <CategoryDetail category={response.data} />
        )}
        {response.status === 'error' && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertTriangleIcon />
              </EmptyMedia>
              <EmptyTitle>Erro ao carregar categoria</EmptyTitle>
              <EmptyDescription>
                Não foi possível carregar os detalhes da categoria. Tente
                novamente.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SheetContent>
    </Sheet>
  );
}
