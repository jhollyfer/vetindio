import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryStatus, type Category } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { EllipsisIcon, EyeIcon, PencilIcon } from "lucide-react";
import React from "react";

interface Props {
  data: Category[];
  headers: readonly string[];
}

function TableCategoryRow({ data }: { data: Category }) {
  const showCategorySheetButtonRef = React.useRef<HTMLButtonElement | null>(
    null
  );
  const updateCategorySheetButtonRef = React.useRef<HTMLButtonElement | null>(
    null
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
            "font-semibold border-transparent",
            data.status === CategoryStatus.ACTIVE &&
              "bg-green-100 text-green-700",
            data.status === CategoryStatus.INACTIVE && "bg-red-100 text-red-700"
          )}
        >
          {data?.status}
        </Badge>
      </TableCell>
      <TableCell className="w-20">
        <DropdownMenu dir="ltr" modal={false}>
          <DropdownMenuTrigger className="p-1 rounded-full ">
            <EllipsisIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-10">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full"
              onClick={() => {
                showCategorySheetButtonRef?.current?.click();
              }}
            >
              <EyeIcon className="size-4" />
              <span>Visualizar</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="inline-flex space-x-1 w-full"
              onClick={() => {
                updateCategorySheetButtonRef?.current?.click();
              }}
            >
              <PencilIcon className="size-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <ShowUserSheet ref={showCategorySheetButtonRef} _id={user._id} /> */}
        {/* <UpdateUserSheet ref={updateCategorySheetButtonRef} _id={user._id} /> */}
      </TableCell>
    </TableRow>
  );
}

export function TableCategories({ data, headers }: Props): React.ReactElement {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow className="">
          {headers?.map((head) => (
            <TableHead key={head}>
              <span>{head}</span>
            </TableHead>
          ))}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((category) => (
          <TableCategoryRow data={category} />
        ))}
      </TableBody>
    </Table>
  );
}
