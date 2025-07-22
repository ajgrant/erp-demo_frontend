"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Payment } from "../columns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, sub } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { set, z } from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const schema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  date: z.coerce.date(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().min(1, "Customer email is required"),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
  products: z.array(
    z.object({
      productId: z.string().min(1),
      name: z.string().min(1),
      quantity: z.number().min(1),
      price: z.number().min(0),
      stock: z.number(),
    })
  ),
});

const DISCOUNT_RATE = 0.1; // 10% discount rate
const TAX_RATE = 0.08; // 8% tax rate

export default function newInvoicePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  // Helper to format date for input[type="datetime-local"]
  function formatDateTimeLocal(date: Date) {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_number: "",
      date: new Date(),
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      notes: "",
      products: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });
  const watchedForm = form.watch();
  const watchedProducts = watchedForm.products || [];

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/products?filters[name][$containsi]=${searchTerm}&pagination[pageSize]=25`
        );
        const products = response.data.data.map((item: any) => ({
          productId: item.documentId,
          name: item.name,
          price: item.price,
          stock: item.stock,
        }));
        setSearchResults(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }, 400);
  }, [searchTerm]);

  const handleSelectedProduct = (product: any) => {
    const existingProduct = form
      .getValues("products")
      .find((item) => item.productId === product.productId);
    if (existingProduct) {
      toast.error("Product already added to invoice");
    } else {
      append({
        productId: product.productId,
        name: product.name,
        quantity: 1,
        price: Number(product.price),
        stock: Number(product.stock),
      });
    }
    setSearchTerm("");
    setSearchResults([]);
  };

  const calculateAmount = (quantity: number, price: number) => {
    if (isNaN(quantity) || isNaN(price)) return 0.0;
    return quantity * price;
  };
  useEffect(() => {
    if (!watchedProducts || watchedProducts.length === 0) {
      setSubtotal(0);
      return;
    }
    const newSubtotal = watchedProducts.reduce((acc, current) => {
      const amount = calculateAmount(
        Number(current.quantity) || 0,
        Number(current.price) || 0
      );
      return acc + amount;
    }, 0);
    setSubtotal(newSubtotal);
  }, [watchedForm]);

  useEffect(() => {
    const discountAmount = subtotal * DISCOUNT_RATE;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * TAX_RATE;
    setTotal(taxableAmount + taxAmount);
  }, [subtotal]);

  async function onSubmit(data: z.infer<typeof schema>) {
    setSaving(true);
    if (watchedProducts.length === 0) {
      toast.error("Please add at least one product to the invoice");
      setSaving(false);
      return;
    }
    try {
      const salePayload = {
        invoice_number: data.invoice_number,
        date: data.date,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        notes: data.notes,
        products: data.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
          price: product.price,
        })),
        subtotal: subtotal,
        discount_amount: subtotal * DISCOUNT_RATE,
        tax_amount: subtotal * DISCOUNT_RATE * TAX_RATE,
        total: total,
      };
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/sale-transactions`,
        { data: salePayload }
      );
      if (!response.data.data?.id) {
        throw new Error("Failed to create sale transaction");
      }
      router.push("/dashboard/sales");
      toast.success("Invoice created successfully");
    } catch (error) {
      console.log("Error submitting form:", error);
      toast.error("Error submitting form: " + String(error));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full p-4 space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Link href="/dashboard/sales">
                <ArrowLeftIcon className="mr-2" />
              </Link>
              Create New Invoice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label className="mb-4 text-lg text-primary">Invoice Details</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Invoice Number"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Date & Time"
                        type="datetime-local"
                        {...field}
                        className="w-fit"
                        value={
                          field.value
                            ? formatDateTimeLocal(
                                new Date(field.value as string)
                              )
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer Name"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Customer Email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer Phone" type="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />
            <Label className="mb-4 text-lg text-primary">Product Details</Label>
            <div>
              <Label className="mb-2">Search Products</Label>
              <Suspense fallback={<p className="text-sm my-2">Searching...</p>}>
                <Input
                  placeholder="Search products by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <ScrollArea className="border rounded p-2 max-h-60 mt-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.productId}
                        className="cursor-pointer p-2 hover:bg-muted rounded"
                        onClick={() => handleSelectedProduct(product)}
                      >
                        <span className="font-semibold">
                          {product.name}: ${product.price}
                        </span>
                        <span className="text-sm">
                          - {product.stock} in stock
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </Suspense>
            </div>
            {fields?.map((item, index) => {
              const currentQuantity = watchedProducts?.[index]?.quantity || 0;
              const currentPrice = watchedProducts?.[index]?.price || 0;
              return (
                <div
                  key={item.id}
                  className="border p-3 rounded mb-2 grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
                >
                  <div>
                    <Label className="mb-2">Product</Label>
                    <Input value={item.name} readOnly />
                  </div>
                  <FormField
                    control={form.control}
                    name={`products.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
                            }
                            min={1}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`products.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
                            }
                            min={0}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label className="mb-2">Amount</Label>
                    <Input
                      className="text-primary"
                      value={calculateAmount(
                        currentQuantity as number,
                        currentPrice as number
                      ).toFixed(2)}
                      readOnly
                    />
                  </div>
                  <div className="pt-6">
                    <Button variant="destructive" onClick={() => remove(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
            <Separator />
            <Label className="mb-4 text-lg text-primary">Invoice Summary</Label>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl className="h-36">
                        <Textarea
                          placeholder="Additional notes"
                          {...field}
                          rows={10}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2 flex flex-col justify-end space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-${(subtotal * DISCOUNT_RATE).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(subtotal * TAX_RATE).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 w-full items-center">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Submitting..." : "Submit Invoice"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      router.push("/dashboard/sales");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
