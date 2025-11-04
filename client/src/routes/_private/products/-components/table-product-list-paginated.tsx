import {
  EllipsisIcon,
  EyeIcon,
  PackageIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import React from 'react';

import { DialogProductDelete } from './dialog-product-delete';
import { SheetProductShow } from './sheet-product-show';
import { SheetProductUpdate } from './sheet-product-update';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type Product } from '@/lib/entities';
import { cn } from '@/lib/utils';

interface Props {
  data: Product[];
  headers: readonly string[];
}

function TableProductListSkeletonRow(): React.JSX.Element {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell className="w-8">
        <Skeleton className="h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export function TableProductListSkeleton({
  headers,
}: {
  headers: readonly string[];
}): React.JSX.Element {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          {headers.map((head) => (
            <TableHead key={head}>
              <span>{head}</span>
            </TableHead>
          ))}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableProductListSkeletonRow key={index} />
        ))}
      </TableBody>
    </Table>
  );
}

function TableProductListRowPaginated({
  data,
}: {
  data: Product;
}): React.JSX.Element {
  const sheetProductShowButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );
  const sheetProductUpdateButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );
  const dialogProductDeleteButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );

  return (
    <TableRow key={data.id}>
      <TableCell className="font-medium">{data.name}</TableCell>
      <TableCell className="font-mono text-sm">{data.sku}</TableCell>
      <TableCell>
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(data.price / 100)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
            data.stock > 10
              ? 'bg-green-50 text-green-700'
              : data.stock > 0
                ? 'bg-yellow-50 text-yellow-700'
                : 'bg-red-50 text-red-700',
          )}
        >
          {data.stock}
        </span>
      </TableCell>
      <TableCell className="max-w-48 truncate text-muted-foreground">
        {data.description || 'Sem descrição'}
      </TableCell>
      <TableCell className="w-20">
        <DropdownMenu
          dir="ltr"
          modal={false}
        >
          <DropdownMenuTrigger className="p-1 rounded-full ">
            <EllipsisIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-10">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full"
              onClick={() => {
                sheetProductShowButtonRef?.current?.click();
              }}
            >
              <EyeIcon className="size-4" />
              <span>Visualizar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full"
              onClick={() => {
                sheetProductUpdateButtonRef?.current?.click();
              }}
            >
              <PencilIcon className="size-4" />
              <span>Editar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full text-destructive focus:text-destructive"
              onClick={() => {
                dialogProductDeleteButtonRef?.current?.click();
              }}
            >
              <Trash2Icon className="size-4" />
              <span>Deletar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SheetProductShow
          productId={data.id}
          ref={sheetProductShowButtonRef}
        >
          Visualizar produto
        </SheetProductShow>

        <SheetProductUpdate
          productId={data.id}
          ref={sheetProductUpdateButtonRef}
        >
          Editar produto
        </SheetProductUpdate>

        <DialogProductDelete
          productId={data.id}
          ref={dialogProductDeleteButtonRef}
        >
          Deletar produto
        </DialogProductDelete>
      </TableCell>
    </TableRow>
  );
}

export function TableProductListPaginated({
  data,
  headers,
}: Props): React.JSX.Element {
  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhum produto encontrado</EmptyTitle>
          <EmptyDescription>
            Crie seu primeiro produto para começar a vender
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          {headers.map((head) => (
            <TableHead key={head}>
              <span>{head}</span>
            </TableHead>
          ))}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((product) => (
          <TableProductListRowPaginated
            key={product.id}
            data={product}
          />
        ))}
      </TableBody>
    </Table>
  );
}
