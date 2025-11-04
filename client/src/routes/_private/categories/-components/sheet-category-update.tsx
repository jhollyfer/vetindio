import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { AlertTriangleIcon, LoaderCircleIcon, PencilIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/lib/api';
import { QUERY_KEY, QueryClient } from '@/lib/client-query';
import type { Category, CategoryStatus, Paginated } from '@/lib/entities';

const SchemaCategoryUpdate = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

function CategoryUpdateSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Nome</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

interface FormProps {
  category: Category;
  onClose: () => void;
}

function FormCategoryUpdate({
  category,
  onClose,
}: FormProps): React.JSX.Element {
  const search = useSearch({
    from: '/_private/categories/',
  });

  const mutationCategoryUpdate = useMutation({
    mutationFn: async function (payload: z.infer<typeof SchemaCategoryUpdate>) {
      const route = `/categories/${category.id}`;
      const response = await API.put<Category>(route, payload);
      return response.data;
    },
    onSuccess(data) {
      // Atualizar cache da listagem paginada
      QueryClient.setQueryData<Paginated<Category>>(
        [QUERY_KEY.CATEGORY.LIST_PAGINATED, search],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((category) =>
              category.id === data.id ? data : category,
            ),
          };
        },
      );

      // Atualizar cache do show individual
      QueryClient.setQueryData<Category>(
        [QUERY_KEY.CATEGORY.SHOW, category.id],
        data,
      );

      toast('Categoria atualizada.', {
        className: '!bg-primary !text-primary-foreground !border-primary',
        description: `Categoria "${data.name}" editada com sucesso`,
        descriptionClassName: '!text-primary-foreground',
        closeButton: true,
      });
      onClose();
    },
    onError(error) {
      if (error instanceof AxiosError) {
        const data = error.response?.data;

        // 400 - INVALID_PARAMETERS
        if (data?.code === 400 && data?.cause === 'INVALID_PARAMETERS') {
          toast.error(data?.message ?? 'Dados inválidos');
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

        // 500 - SERVER_ERROR
        if (data?.code === 500) {
          toast.error(data?.message ?? 'Erro interno do servidor');
        }
      }

      console.error(error);
    },
  });

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: 'ACTIVE' as CategoryStatus,
    },
    validators: {
      onSubmit: SchemaCategoryUpdate,
    },
    onSubmit: async ({ value }) => {
      if (mutationCategoryUpdate.status === 'pending') return;

      const payload = {
        name: value.name,
        status: value.status,
        ...(value.description && { description: value.description }),
      };

      await mutationCategoryUpdate.mutateAsync(payload);
    },
  });


  return (
    <form
      id="category-update-form"
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
          defaultValue={category.name}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Nome
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Nome da categoria"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="description"
          defaultValue={category.description}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Descrição da categoria (opcional)"
                  rows={3}
                  className="resize-none"
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  Adicione uma descrição opcional para a categoria.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="status"
          defaultValue={category.status}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  Status
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={field.state.value}
                  defaultValue={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as CategoryStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Defina se a categoria está ativa ou inativa.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="inline-flex flex-1 justify-end w-full gap-2">
        <Button
          type="submit"
          form="category-update-form"
          disabled={mutationCategoryUpdate.status === 'pending'}
        >
          {mutationCategoryUpdate.status === 'pending' && (
            <Spinner className="size-4" />
          )}
          {mutationCategoryUpdate.status === 'pending' ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

interface SheetCategoryUpdateProps
  extends React.ComponentProps<typeof SheetTrigger> {
  categoryId: string;
}

export function SheetCategoryUpdate({
  categoryId,
  ...props
}: SheetCategoryUpdateProps): React.JSX.Element {
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
          <SheetTitle className="text-lg font-medium flex items-center gap-2">
            <PencilIcon className="size-5" />
            Editar categoria
          </SheetTitle>
          <SheetDescription>
            Faça alterações na categoria selecionada
          </SheetDescription>
        </SheetHeader>

        {response.status === 'pending' && <CategoryUpdateSkeleton />}
        {response.status === 'success' && (
          <FormCategoryUpdate
            category={response.data}
            onClose={() => setOpen(false)}
          />
        )}
        {response.status === 'error' && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertTriangleIcon />
              </EmptyMedia>
              <EmptyTitle>Erro ao carregar categoria</EmptyTitle>
              <EmptyDescription>
                Não foi possível carregar os dados da categoria. Tente
                novamente.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SheetContent>
    </Sheet>
  );
}
