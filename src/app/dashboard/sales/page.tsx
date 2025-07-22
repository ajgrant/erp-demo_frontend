"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getColumns, Payment } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import IconLoader2 from "@tabler/icons-react/dist/esm/icons/IconLoader2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Alert } from "@/components/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { parse, startOfDay, endOfDay } from "date-fns";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const [sales, setSales] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    invoice_number: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    date: "",
    total: "",
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const router = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(pageSize));
    if (filters.invoice_number) {
      params.set("filters[invoice_number][$containsi]", filters.invoice_number);
    }
    if (filters.customer_name) {
      params.set("filters[customer_name][$containsi]", filters.customer_name);
    }
    if (filters.date) {
      // parse a local Date from "YYYY-MM-DD"
      const dt = parse(filters.date, "yyyy-MM-dd", new Date());
      params.set("filters[date][$gte]", startOfDay(dt).toISOString());
      params.set("filters[date][$lte]", endOfDay(dt).toISOString());
    }
    if (filters.customer_email) {
      params.set("filters[customer_email][$containsi]", filters.customer_email);
    }
    if (filters.customer_phone) {
      params.set("filters[customer_phone][$containsi]", filters.customer_phone);
    }
    return params.toString();
  };
  const fetchData = () => {
    axiosInstance
      .get(`/api/sales?${buildQueryParams()}`)
      .then((response) => {
        setSales(response.data.data);
        setMeta(response.data.meta.pagination);
        console.log(response);
      })
      .catch((error) => {
        console.error("Error fetching sales:", error);
      })
      .finally(() => {});
  };
  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);
  const handlePageChange = (newPage: string) => {
    setPageSize(Number(newPage));
    setPage(1);
  };
  const handleDelete = async (item: any) => {
    if (!item?.id) return;
    console.log("Deleting item:", item);
    try {
      await axiosInstance.delete(`/api/sales/${item.documentId}`);
      toast.success("Sale deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
    }
  };

  return (
    <div className="py-4 md:py-6 px-4 lg:px-6">
      <Suspense
        fallback={
          <IconLoader2 className="size-10 animate-spin mx-auto h-screen text-gray-500" />
        }
      >
        <Card className="@container/card">
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>
              <span>List of sales</span>
            </CardDescription>
            <CardAction>
              <Button
                onClick={() => router.push("/dashboard/sales/new-invoice")}
              >
                Add a new invoice
              </Button>
            </CardAction>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={getColumns(
                filters,
                handleFilterChange,
                (item: any) => {
                  setSelectedItem(item);
                  setSheetOpen(true);
                },
                (item: any) => {
                  setSelectedItem(item);
                  setAlertOpen(true);
                }
              )}
              data={sales}
            />
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              {meta && (
                <>
                  {sales.length === 0
                    ? "No rows"
                    : `Showing ${(meta.page - 1) * meta.pageSize + 1} to ${
                        (meta.page - 1) * meta.pageSize + sales.length
                      } of ${meta.total} records`}
                </>
              )}
              <div className="flex items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={handlePageChange}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span>Rows per page</span>
              </div>
              <span>
                Page {meta?.page} of {meta?.pageCount}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  ⏪️
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  ⬅️
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, meta?.pageCount))
                  }
                  disabled={page === meta?.pageCount}
                >
                  ➡️
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(meta?.pageCount)}
                  disabled={page === meta?.pageCount}
                >
                  ⏩️
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <Alert onConfirm={() => handleDelete(selectedItem)} />
        </AlertDialog>
      </Suspense>
    </div>
  );
}
