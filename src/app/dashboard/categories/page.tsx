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
import { Sheet } from "@/components/ui/sheet";
import { New } from "./new";
import { toast } from "sonner";
import { Alert } from "@/components/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Payment[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: "", description: "" });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(pageSize));
    if (filters.name) {
      params.set("filters[name][$containsi]", filters.name);
    }
    if (filters.description) {
      params.set("filters[description][$containsi]", filters.description);
    }
    return params.toString();
  };
  const fetchData = () => {
    axiosInstance
      .get(`/api/categories?${buildQueryParams()}`)
      .then((response) => {
        const apiData = response.data.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          documentId: item.documentId,
        }));
        setCategories(apiData);
        setMeta(response.data.meta.pagination);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
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
    try {
      await axiosInstance.delete(`/api/categories/${item.documentId}`);
      toast.success("Category deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
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
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              <span>List of categories</span>
            </CardDescription>
            <CardAction>
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setSheetOpen(true);
                }}
              >
                Add a new record
              </Button>
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <New
                  item={selectedItem}
                  isOpen={sheetOpen}
                  onSuccess={() => {
                    setSheetOpen(false);
                    fetchData();
                  }}
                />
              </Sheet>
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
              data={categories}
            />
            <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
              {meta && (
                <>
                  {categories.length === 0
                    ? "No rows"
                    : `Showing ${(meta.page - 1) * meta.pageSize + 1} to ${
                        (meta.page - 1) * meta.pageSize + categories.length
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
