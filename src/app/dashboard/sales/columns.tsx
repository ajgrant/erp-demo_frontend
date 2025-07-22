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
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  documentId: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  invoice_number: string;
  date: string;
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  products: any[];
};

export const getColumns = (
  filters: any,
  handleFilterChange: (key: string, value: string) => void,
  onEdit: any,
  onDelete: any
): ColumnDef<Payment>[] => [
  {
    accessorKey: "invoice_number",
    header: () => (
      <ColumnFilter
        label="Invoice Number"
        placeholder="Filter invoice number..."
        value={filters.invoice_number || ""}
        onChange={(val) => handleFilterChange("invoice_number", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "customer_name",
    header: () => (
      <ColumnFilter
        label="Customer Name"
        placeholder="Filter customer name..."
        value={filters.customer_name || ""}
        onChange={(val) => handleFilterChange("customer_name", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "customer_email",
    header: () => (
      <ColumnFilter
        label="Customer Email"
        placeholder="Filter customer email..."
        value={filters.customer_email || ""}
        onChange={(val) => handleFilterChange("customer_email", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "customer_phone",
    header: () => (
      <ColumnFilter
        label="Customer Phone"
        placeholder="Filter customer phone..."
        value={filters.customer_phone || ""}
        onChange={(val) => handleFilterChange("customer_phone", val)}
      />
    ),
    cell: (row) => row.getValue(),
  },
  {
    accessorKey: "date",
    header: () => (
      <ColumnFilter
        label="Date"
        placeholder="Filter date..."
        value={filters.date || ""}
        onChange={(val) => handleFilterChange("date", val)}
        type="date"
      />
    ),
    cell: (row) => {
      const dateStr = row.getValue() as string | undefined;
      if (!dateStr) return "N/A";
      // convert the UTC timestamp into the local timezone
      const localDate = toZonedTime(
        dateStr,
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      // format it however you like
      return format(localDate, "yyyy-MM-dd, hh:mm a");
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: (row) => {
      return row.getValue()
        ? `$${(row.getValue() as number).toFixed(2)}`
        : "N/A";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
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
          <Link href={`/dashboard/sales/invoice/${row.original.documentId}`}>
            <DropdownMenuItem>View Invoice</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(row.original)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
