"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price is required"),
  stock: z.coerce.number().int().min(0, "Stock is required"),
  barcode: z.string().min(1, "Barcode is required"),
  category: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .required(),
});

export function New({
  item,
  onSuccess,
  isOpen,
}: {
  item: any;
  onSuccess?: () => void;
  isOpen: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      stock: "",
      barcode: "",
      category: { id: undefined, name: "" },
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        stock: item.stock || "",
        barcode: item.barcode || "",
        category: {
          id: item.category.id || undefined,
          name: item.category.name || "",
        },
      });
      if (item.image) {
        setImagePreview(item.image.url);
        setImageId(item.image.id);
      } else {
        setImagePreview(null);
        setImageId(null);
      }
    } else {
      form.reset({
        name: "",
        description: "",
        price: "",
        stock: "",
        barcode: "",
        category: { id: undefined, name: "" },
      });
      setImagePreview(null);
      setImageId(null);
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;
    axiosInstance
      .get(`/api/categories`)
      .then((response) => {
        setCategories(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [isOpen]);

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);
    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await axiosInstance.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          if (typeof total === "number" && total > 0) {
            setUploadProgress(Math.round((loaded / total) * 100));
          }
        },
      });
      setImagePreview(response.data[0].url);
      setImageId(response.data[0].id);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (item?.id) {
      // Update existing product
      await axiosInstance.put(`/api/products/${item.documentId}`, {
        data: {
          ...values,
          category: values.category.id,
          image: imageId ? imageId : null,
        },
      });
      if (onSuccess) onSuccess();
      toast.success("Product updated successfully");
    } else {
      // Create new product
      await axiosInstance.post("/api/products", {
        data: {
          ...values,
          category: values.category.id,
          image: imageId ? imageId : null,
        },
      });
      if (onSuccess) onSuccess();
      toast.success("Product created successfully");
    }
  }
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{item?.id ? "Edit" : "Add New"} Product</SheetTitle>
        <SheetDescription>
          Fill in the details below to create a new product.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-3xl mx-4 py-4 overflow-y-scroll pb-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    // bind to the id as a string
                    value={field.value?.id?.toString() || ""}
                    // when user picks an id, look up the full object and pass it back
                    onValueChange={(value) => {
                      const selected = categories.find(
                        (c) => c.id.toString() === value
                      );
                      if (selected) {
                        field.onChange({
                          id: selected.id,
                          name: selected.name,
                        });
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Product price"
                    type="number"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Product stock"
                    type="number"
                    value={field.value as number}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input placeholder="Product barcode" type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <FormLabel>Image</FormLabel>
            {imagePreview && (
              <div className="relative w-full max-w-xs">
                <Image
                  src={process.env.NEXT_PUBLIC_STRAPI_URL + imagePreview}
                  alt="Image preview"
                  width={500}
                  height={500}
                  style={{ objectFit: "cover" }}
                  className="object-cover w-full h-48"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-white/80 hover:bg-white/80 rounded-full p-1 shadow"
                  onClick={() => {
                    setImagePreview(null);
                    setImageId(null);
                  }}
                >
                  <X className="h-4 w-4 text-red-500" />
                </button>
              </div>
            )}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-primary hover:underline">
                <UploadCloud className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            {uploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </div>
            )}
          </div>
          <Button type="submit">{item?.id ? "Update" : "Submit"}</Button>
        </form>
      </Form>
    </SheetContent>
  );
}
