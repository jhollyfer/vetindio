import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { AlertTriangleIcon } from 'lucide-react';
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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import type { Paginated, Product } from '@/lib/entities';

const SchemaProductUpdate = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  price: z
    .number({ message: 'Preço deve ser um número válido' })
    .min(0.01, 'Preço deve ser maior que zero'),
  stock: z
    .number({ message: 'Estoque deve ser um número válido' })
    .min(0, 'Estoque não pode ser negativo'),
  sku: z
    .string()
    .min(1, 'SKU é obrigatório')
    .max(50, 'SKU deve ter no máximo 50 caracteres'),
});

function ProductUpdateSkeleton(): React.JSX.Element {
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
          <CardTitle>SKU</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card className="py-4 px-3 shadow-none gap-2">
        <CardHeader className="p-0">
          <CardTitle>Preço</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

interface FormProps {
  product: Product;
  onClose: () => void;
}

function FormProductUpdate({ product, onClose }: FormProps): React.JSX.Element {
  const search = useSearch({
    from: '/_private/products/',
  });

  const mutationProductUpdate = useMutation({
    mutationFn: async function (payload: z.infer<typeof SchemaProductUpdate>) {
      const route = `/products/${product.id}`;
      const response = await API.patch<Product>(route, payload);
      return response.data;
    },
    onSuccess(data) {
      QueryClient.setQueryData<Paginated<Product>>(
        [QUERY_KEY.PRODUCT.LIST_PAGINATED, search],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            data: old.data.map((item) =>
              item.id === data.id ? data : item
            ),
          };
        },
      );

      QueryClient.setQueryData([QUERY_KEY.PRODUCT.SHOW, product.id], data);

      toast('Produto atualizado.', {
        className: '!bg-primary !text-primary-foreground !border-primary',
        description: `Produto "${data.name}" atualizado com sucesso`,
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

        // 404 - PRODUCT_NOT_FOUND
        if (data?.code === 404 && data?.cause === 'PRODUCT_NOT_FOUND') {
          toast.error(data?.message ?? 'Produto não encontrado');
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
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      sku: product.sku,
    },
    validators: {
      onSubmit: SchemaProductUpdate,
    },
    onSubmit: async ({ value }) => {
      if (mutationProductUpdate.status === 'pending') return;

      const payload = {
        name: value.name,
        sku: value.sku,
        price: value.price,
        stock: value.stock,
        ...(value.description && { description: value.description }),
      };

      await mutationProductUpdate.mutateAsync(payload);
    },
  });

  return (
    <form
      id="product-update-form"
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
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
                  placeholder="Nome do produto"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="sku"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  SKU
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="SKU do produto"
                  autoComplete="off"
                />
                <FieldDescription>
                  Código único de identificação do produto
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="price"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Preço (centavos)
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="1"
                    step="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                    placeholder="1999"
                  />
                  <FieldDescription>
                    Preço em centavos (ex: 1999 = R$ 19,99)
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="stock"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    Estoque
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min="0"
                    step="1"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    aria-invalid={isInvalid}
                    placeholder="10"
                  />
                  <FieldDescription>
                    Quantidade disponível em estoque
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="description"
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
                  placeholder="Descrição do produto (opcional)"
                  rows={3}
                  className="resize-none"
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  Adicione uma descrição opcional para o produto.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="inline-flex flex-1 justify-end w-full gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
          disabled={mutationProductUpdate.status === 'pending'}
        >
          Resetar
        </Button>
        <Button
          type="submit"
          form="product-update-form"
          disabled={mutationProductUpdate.status === 'pending'}
        >
          {mutationProductUpdate.status === 'pending' && (
            <Spinner className="size-4" />
          )}
          {mutationProductUpdate.status === 'pending'
            ? 'Atualizando...'
            : 'Atualizar'}
        </Button>
      </div>
    </form>
  );
}

function ProductUpdateError(): React.JSX.Element {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangleIcon />
        </EmptyMedia>
        <EmptyTitle>Erro ao carregar produto</EmptyTitle>
        <EmptyDescription>
          Não foi possível carregar os dados do produto para edição.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

interface SheetProductUpdateProps
  extends React.ComponentProps<typeof SheetTrigger> {
  productId: string;
}

export const SheetProductUpdate = React.forwardRef<
  HTMLButtonElement,
  SheetProductUpdateProps
>(function SheetProductUpdate({ productId, children, ...props }, ref) {
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
          <SheetTitle className="text-lg font-medium">Editar produto</SheetTitle>
          <SheetDescription>Atualize as informações do produto</SheetDescription>
        </SheetHeader>

        {response.status === 'pending' && <ProductUpdateSkeleton />}
        {response.status === 'error' && <ProductUpdateError />}
        {response.status === 'success' && (
          <FormProductUpdate
            product={response.data}
            onClose={() => setOpen((state) => !state)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
});