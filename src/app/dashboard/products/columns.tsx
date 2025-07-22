"use client";

import ColumnFilter from "@/components/column-filter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Product = {
  id: string;
  price: number;
  barcode: string;
  image: any;
  name: string;
  stock: number;
  category: {
    id: string;
    name: string;
  };
};

export const getColumns = (
  filters: any,
  handleFilterChange: (key: string, value: string) => void,
  onEdit: any,
  onDelete: any
): ColumnDef<Product>[] => [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="h-12 w-12 rounded-full overflow-hidden">
        {row.original.image ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${row.original.image.formats.thumbnail.url}`}
            alt="Product Image"
            width={50}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>
    ),
  },
  {
    accessorKey: "barcode",
    header: () => (
      <ColumnFilter
        label="Barcode"
        placeholder="Filter barcode..."
        value={filters.barcode || ""}
        onChange={(val) => handleFilterChange("barcode", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "name",
    header: () => (
      <ColumnFilter
        label="Name"
        placeholder="Filter name..."
        value={filters.name || ""}
        onChange={(val) => handleFilterChange("name", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "category.name",
    header: () => (
      <ColumnFilter
        label="Category"
        placeholder="Filter category..."
        value={filters.category || ""}
        onChange={(val) => handleFilterChange("category", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  { accessorKey: "price", header: "Price" },
  { accessorKey: "stock", header: "Stock" },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
