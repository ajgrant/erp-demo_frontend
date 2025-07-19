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
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [isOpen, item]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (item?.id) {
      // Update existing category
      await axiosInstance.put(`/api/categories/${item.documentId}`, {
        data: values,
      });
      if (onSuccess) onSuccess();
      toast.success("Category updated successfully");
    } else {
      // Create new category
      await axiosInstance.post("/api/categories", { data: values });
      if (onSuccess) onSuccess();
      toast.success("Category created successfully");
    }
  }
  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{item?.id ? "Edit" : "Add New"} Category</SheetTitle>
        <SheetDescription>
          Fill in the details below to create a new category.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 max-w-3xl mx-4 py-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category Name" type="" {...field} />
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
                    placeholder="Category description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">{item?.id ? "Update" : "Submit"}</Button>
        </form>
      </Form>
    </SheetContent>
  );
}
