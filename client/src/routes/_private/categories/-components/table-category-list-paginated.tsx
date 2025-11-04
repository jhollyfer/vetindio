import { EllipsisIcon, EyeIcon, FolderIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import React from 'react';

import { DialogCategoryDelete } from './dialog-category-delete';
import { SheetCategoryShow } from './sheet-category-show';
import { SheetCategoryUpdate } from './sheet-category-update';

import { Badge } from '@/components/ui/badge';
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
import { CategoryStatus, type Category } from '@/lib/entities';
import { cn } from '@/lib/utils';

interface Props {
  data: Category[];
  headers: readonly string[];
}

function TableCategoryListSkeletonRow(): React.JSX.Element {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell className="w-20">
        <Skeleton className="h-6 w-6 rounded-full" />
      </TableCell>
    </TableRow>
  );
}

export function TableCategoryListSkeleton({
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
          <TableCategoryListSkeletonRow key={index} />
        ))}
      </TableBody>
    </Table>
  );
}

function TableCategoryListRowPaginated({
  data,
}: {
  data: Category;
}): React.JSX.Element {
  const sheetCategoryShowButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );
  const sheetCategoryUpdateButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );
  const dialogCategoryDeleteButtonRef = React.useRef<HTMLButtonElement | null>(
    null,
  );

  return (
    <TableRow key={data.id}>
      <TableCell>{data.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{data.slug}</Badge>
      </TableCell>
      <TableCell>{data.description}</TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={cn(
            'border-transparent font-medium',
            data.status === CategoryStatus.ACTIVE &&
              'bg-green-100 text-green-700',
            data.status === CategoryStatus.INACTIVE &&
              'bg-red-100 text-red-700',
          )}
        >
          {data?.status === CategoryStatus.ACTIVE ? 'Ativo' : 'Inativo'}
        </Badge>
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
                sheetCategoryShowButtonRef?.current?.click();
              }}
            >
              <EyeIcon className="size-4" />
              <span>Visualizar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full"
              onClick={() => {
                sheetCategoryUpdateButtonRef?.current?.click();
              }}
            >
              <PencilIcon className="size-4" />
              <span>Editar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full text-destructive focus:text-destructive"
              onClick={() => {
                dialogCategoryDeleteButtonRef?.current?.click();
              }}
            >
              <Trash2Icon className="size-4" />
              <span>Deletar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SheetCategoryShow
          categoryId={data.id}
          ref={sheetCategoryShowButtonRef}
        >
          Visualizar categoria
        </SheetCategoryShow>

        <SheetCategoryUpdate
          categoryId={data.id}
          ref={sheetCategoryUpdateButtonRef}
        >
          Editar categoria
        </SheetCategoryUpdate>

        <DialogCategoryDelete
          categoryId={data.id}
          ref={dialogCategoryDeleteButtonRef}
        >
          Deletar categoria
        </DialogCategoryDelete>
      </TableCell>
    </TableRow>
  );
}

export function TableCategoryListPaginated({
  data,
  headers,
}: Props): React.JSX.Element {
  if (data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhuma categoria encontrada</EmptyTitle>
          <EmptyDescription>
            Crie sua primeira categoria para organizar seus produtos
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
        {data.map((category) => (
          <TableCategoryListRowPaginated
            key={category.id}
            data={category}
          />
        ))}
      </TableBody>
    </Table>
  );
}
