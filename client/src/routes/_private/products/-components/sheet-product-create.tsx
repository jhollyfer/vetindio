import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { PlusIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { API } from '@/lib/api';
import { QUERY_KEY, QueryClient } from '@/lib/client-query';
import type { Paginated, Product } from '@/lib/entities';
import { MetaDefault } from '@/lib/utils';

const SchemaProductCreate = z.object({
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

interface FormProps {
  onClose: () => void;
}

function FormProductCreate({ onClose }: FormProps): React.JSX.Element {
  const search = useSearch({
    from: '/_private/products/',
  });

  const mutationProductCreate = useMutation({
    mutationFn: async function (payload: z.infer<typeof SchemaProductCreate>) {
      const router = '/products';
      const response = await API.post<Product>(router, payload);
      return response.data;
    },
    onSuccess(data) {
      QueryClient.setQueryData<Paginated<Product>>(
        [QUERY_KEY.PRODUCT.LIST_PAGINATED, search],
        (old) => {
          if (!old) {
            return {
              meta: MetaDefault,
              data: [data],
            };
          }

          return {
            meta: {
              ...old.meta,
              total: old.meta.total + 1,
            },
            data: [data, ...old.data],
          };
        },
      );

      toast('Produto criado.', {
        className: '!bg-primary !text-primary-foreground !border-primary',
        description: `Produto "${data.name}" adicionado com sucesso`,
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
          toast.error(data?.message ?? 'Invalid data');
        }

        // 401 - AUTHENTICATION_REQUIRED
        if (data?.code === 401 && data?.cause === 'AUTHENTICATION_REQUIRED') {
          toast.error(data?.message ?? 'Authentication required');
        }

        // 403 - ACCESS_DENIED
        if (data?.code === 403 && data?.cause === 'ACCESS_DENIED') {
          toast.error(data?.message ?? 'Acesso negado');
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
      price: 0,
      stock: 0,
      sku: '',
    },
    validators: {
      onSubmit: SchemaProductCreate,
    },
    onSubmit: async ({ value }) => {
      if (mutationProductCreate.status === 'pending') return;

      const payload = {
        name: value.name,
        sku: value.sku,
        price: value.price,
        stock: value.stock,
        ...(value.description && { description: value.description }),
      };

      await mutationProductCreate.mutateAsync(payload);
    },
  });

  return (
    <form
      id="product-create-form"
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
          disabled={mutationProductCreate.status === 'pending'}
        >
          Limpar
        </Button>
        <Button
          type="submit"
          form="product-create-form"
          disabled={mutationProductCreate.status === 'pending'}
        >
          {mutationProductCreate.status === 'pending' && (
            <Spinner className="size-4" />
          )}
          {mutationProductCreate.status === 'pending'
            ? 'Criando...'
            : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
}

export function SheetProductCreate(): React.JSX.Element {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Button
          type="button"
          className="py-1 px-2  h-auto inline-flex gap-1 cursor-pointer"
        >
          <PlusIcon className="size-4" />
          <span>Novo produto</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col py-4 px-6 gap-5 sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="px-0">
          <SheetTitle className="text-lg font-medium">Novo produto</SheetTitle>
          <SheetDescription>Adicione um novo produto</SheetDescription>
        </SheetHeader>

        <FormProductCreate onClose={() => setOpen((state) => !state)} />
      </SheetContent>
    </Sheet>
  );
}
