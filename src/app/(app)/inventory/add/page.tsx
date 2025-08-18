
"use client";

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import PageTitle from '@/components/shared/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ImagePlus, Loader2, Info } from 'lucide-react';
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from '@/context/auth-context';
import StableImage from '@/components/shared/stable-image';


const productFormSchema = z.object({
  name: z.string().min(3, { message: "Product name must be at least 3 characters." }),
  sku: z.string().min(3, { message: "SKU must be at least 3 characters." }),
  variantDescription: z.string().optional(),
  stock: z.coerce.number().int().min(0, { message: "Stock cannot be negative." }),
  price: z.coerce.number().min(0.01, { message: "Price must be greater than 0." }),
  lowStockThreshold: z.coerce.number().int().min(0, { message: "Low stock threshold cannot be negative." }),
  category: z.string().min(2, { message: "Category is required." }),
  description: z.string().optional(),
  barcode: z.string().optional(),
  image: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function AddProductPage() {
  const { toast } = useToast();
  const { currentBusinessId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSavingProduct, setIsSavingProduct] = React.useState(false);
  
  const parentName = searchParams.get('name');
  const parentCategory = searchParams.get('category');
  const isVariantMode = !!(parentName && parentCategory);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: parentName || "",
      sku: "",
      variantDescription: "",
      stock: 0,
      price: 0,
      lowStockThreshold: 10,
      category: parentCategory || "",
      description: "",
      barcode: "",
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (parentName) form.setValue("name", parentName);
    if (parentCategory) form.setValue("category", parentCategory);
  }, [parentName, parentCategory, form]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: "destructive",
          title: "Image Too Large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    } else {
      setImagePreview(null);
      form.setValue("image", null);
    }
  };

  async function onSubmit(data: ProductFormValues) {
    if (!currentBusinessId) {
        toast({ variant: "destructive", title: "No Business Selected", description: "A product cannot be added without an active business context." });
        return;
    }
    setIsSavingProduct(true);

    let imageUrl = "";
    if (data.image) {
      try {
        const formData = new FormData();
        formData.append('image', data.image);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image.');
        }

        const result = await response.json();
        imageUrl = result.url;
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: `Could not upload image: ${(error as Error).message}`,
        });
        setIsSavingProduct(false);
        return;
      }
    }


    const productDataToSave = {
      name: data.name,
      businessId: currentBusinessId,
      sku: data.sku,
      variantDescription: data.variantDescription || "",
      stock: data.stock,
      price: data.price,
      lowStockThreshold: data.lowStockThreshold,
      category: data.category,
      description: data.description || "",
      barcode: data.barcode || "",
      imageUrl: imageUrl || "",
      dataAiHint: data.name.split(' ').slice(0,2).join(' ').toLowerCase() || "product",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "products"), productDataToSave);
      toast({
        variant: "success",
        title: "Product Saved!",
        description: `${data.name} has been successfully added to your inventory.`,
      });
      
      form.reset({
        name: isVariantMode ? parentName || "" : "",
        category: isVariantMode ? parentCategory || "" : "",
        sku: "",
        variantDescription: "",
        stock: 0,
        price: 0,
        lowStockThreshold: 10,
        description: "",
        barcode: "",
      });
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      router.push('/inventory');

    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      toast({
        variant: "destructive",
        title: "Firestore Save Error",
        description: `Could not save product: ${(error as Error).message}`,
      });
    } finally {
      setIsSavingProduct(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle 
        title={isVariantMode ? "Add Product Variant" : "Add New Product"}
        subtitle={isVariantMode ? `Adding a new variant for "${parentName}"` : "Enter the details for your new product in Zeneva."}
      >
        <Button variant="outline" asChild>
          <Link href="/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </PageTitle>

      {isVariantMode && (
        <Card className="bg-primary/10 border-l-4 border-primary">
            <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold text-foreground">Adding a Variant</h4>
                    <p className="text-sm text-muted-foreground">Product Name and Category are pre-filled. Please provide the unique details for this specific variant, such as its size, color, or volume, and give it a unique SKU.</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Upload an image for the product.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mb-2"
                            ref={fileInputRef}
                            disabled={isSavingProduct}
                          />
                          <div className="mt-2 w-full aspect-square rounded-md border-2 border-dashed border-muted bg-muted/50 flex flex-col items-center justify-center" data-ai-hint="image upload box">
                            {imagePreview ? (
                              <StableImage src={imagePreview} placeholder="https://placehold.co/200x200" alt="Product preview" className="w-full h-full rounded-md object-cover" width={200} height={200} data-ai-hint="new product photo" />
                            ) : (
                               <>
                                <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">No image selected</p>
                               </>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Fill in the basic details of the product for Zeneva.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Classic T-Shirt" {...field} disabled={isSavingProduct || isVariantMode}/>
                        </FormControl>
                        <FormDescription>The general name for the product group.</FormDescription>
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
                          <Input placeholder="e.g., Apparel" {...field} disabled={isSavingProduct || isVariantMode}/>
                        </FormControl>
                         <FormDescription>The group this product belongs to.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="variantDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Details (e.g., Size, Color)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 30ml, Large, Red" {...field} disabled={isSavingProduct}/>
                        </FormControl>
                         <FormDescription>Specific attributes like size or volume.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., CREAM-30ML" {...field} disabled={isSavingProduct}/>
                        </FormControl>
                         <FormDescription>Must be unique for each variant.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 123456789012" {...field} disabled={isSavingProduct}/>
                        </FormControl>
                         <FormDescription>Enter if you use a scanner.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₦)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} disabled={isSavingProduct}/>
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
                        <FormLabel>Current Stock</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} disabled={isSavingProduct}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low Stock Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} disabled={isSavingProduct}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>General Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="General description for the product group. This applies to all variants."
                          className="resize-none"
                          {...field}
                          disabled={isSavingProduct}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
                form.reset({
                    name: isVariantMode ? parentName || "" : "",
                    category: isVariantMode ? parentCategory || "" : "",
                    sku: "",
                    variantDescription: "",
                    stock: 0,
                    price: 0,
                    lowStockThreshold: 10,
                    description: "",
                    barcode: "",
                });
                setImagePreview(null);
                if(fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isSavingProduct}>
              Reset
            </Button>
            <Button type="submit" disabled={isSavingProduct || form.formState.isSubmitting}>
              {isSavingProduct ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSavingProduct ? "Saving..." : (isVariantMode ? "Save Variant" : "Save Product")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
