"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const utils = trpc.useUtils();
  const productId = params?.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    currency: "USD",
    imageLink: "",
    link: "",
    availability: "in stock",
    gtin: "",
    brand: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: product, isLoading } = trpc.product.getById.useQuery(
    { id: productId },
    { enabled: !!productId }
  );

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: () => {
      utils.product.getById.invalidate({ id: productId });
      utils.wizard.getProductReadiness.invalidate();
    },
  });

  const toggleProduct = trpc.wizard.toggleProduct.useMutation({
    onSuccess: () => {
      utils.product.getById.invalidate({ id: productId });
      utils.wizard.getProductReadiness.invalidate();
    },
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price || 0,
        currency: product.currency || "USD",
        imageLink: product.imageLink || "",
        link: product.link || "",
        availability: product.availability || "in stock",
        gtin: product.gtin || "",
        brand: product.brand || "",
      });
    }
  }, [product]);

  // Check which fields are missing
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.title?.trim()) missing.push("Title");
    if (!formData.description?.trim()) missing.push("Description");
    if (!formData.price || formData.price <= 0) missing.push("Price");
    if (!formData.imageLink?.trim()) missing.push("Image URL");
    if (!formData.link?.trim()) missing.push("Product URL");
    if (!formData.availability?.trim()) missing.push("Availability");
    if (!formData.gtin?.trim() && !formData.brand?.trim()) {
      missing.push("GTIN or Brand (at least one required)");
    }
    return missing;
  };

  const missingFields = getMissingFields();
  const isComplete = missingFields.length === 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.imageLink?.trim()) {
      newErrors.imageLink = "Image URL is required";
    } else if (!formData.imageLink.startsWith("http")) {
      newErrors.imageLink = "Image URL must start with https://";
    }

    if (!formData.link?.trim()) {
      newErrors.link = "Product URL is required";
    } else if (!formData.link.startsWith("http")) {
      newErrors.link = "Product URL must start with https://";
    }

    if (!formData.availability?.trim()) {
      newErrors.availability = "Availability is required";
    }

    if (!formData.gtin?.trim() && !formData.brand?.trim()) {
      newErrors.gtinOrBrand = "Either GTIN or Brand is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          currency: formData.currency,
          imageLink: formData.imageLink,
          link: formData.link,
          availability: formData.availability,
          gtin: formData.gtin || undefined,
          brand: formData.brand || undefined,
        },
      });
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save product",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEnable = async (enable: boolean) => {
    try {
      await toggleProduct.mutateAsync({
        productId,
        enableSearch: enable,
        enableCheckout: enable,
      });
    } catch (error) {
      console.error("Failed to toggle product:", error);
    }
  };

  if (!productId) return null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/products")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Button>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground">Edit Product</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Complete all required fields to enable this product for ChatGPT search and
          checkout
        </p>
      </div>

      {/* Status Banner */}
      {isLoading ? (
        <Card className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </Card>
      ) : (
        <>
          {isComplete ? (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900">
                    Product Ready!
                  </h3>
                  <p className="mt-1 text-sm text-green-800 leading-relaxed">
                    All required fields are complete. You can now enable this product for
                    ChatGPT.
                  </p>
                </div>
                {product && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="enable-product"
                      checked={product.enableSearch && product.enableCheckout}
                      onCheckedChange={(checked) =>
                        handleToggleEnable(checked as boolean)
                      }
                      disabled={toggleProduct.isPending}
                    />
                    <label
                      htmlFor="enable-product"
                      className="text-sm font-medium cursor-pointer text-green-900"
                    >
                      Enable for ChatGPT
                    </label>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 p-3">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900">
                    Missing Required Fields
                  </h3>
                  <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                    <strong>Missing:</strong> {missingFields.join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Current Status */}
          {product && (
            <div className="flex items-center gap-3">
              {product.enableSearch && product.enableCheckout ? (
                <Badge className="bg-green-500 text-white">
                  Enabled on ChatGPT
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500 text-amber-700">
                  Not Enabled
                </Badge>
              )}
            </div>
          )}

          {/* Edit Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Required Fields</h3>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Title */}
              <div>
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                  {formData.title?.trim() && (
                    <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Premium Leather Wallet"
                  className="mt-2"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                  {formData.description?.trim() && (
                    <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Handcrafted from genuine Italian leather..."
                  rows={4}
                  className="mt-2"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Price & Currency */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="price">
                    Price <span className="text-destructive">*</span>
                    {formData.price > 0 && (
                      <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                    )}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="49.99"
                    className="mt-2"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, currency: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="imageLink">
                  Image URL <span className="text-destructive">*</span>
                  {formData.imageLink?.trim() && (
                    <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
                <Input
                  id="imageLink"
                  value={formData.imageLink}
                  onChange={(e) =>
                    setFormData({ ...formData, imageLink: e.target.value })
                  }
                  placeholder="https://yourstore.com/images/product.jpg"
                  className="mt-2"
                />
                {errors.imageLink && (
                  <p className="mt-1 text-sm text-destructive">{errors.imageLink}</p>
                )}
                {formData.imageLink && (
                  <img
                    src={formData.imageLink}
                    alt="Product preview"
                    className="mt-2 h-24 w-24 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>

              {/* Product URL */}
              <div>
                <Label htmlFor="link">
                  Product URL <span className="text-destructive">*</span>
                  {formData.link?.trim() && (
                    <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://yourstore.com/products/leather-wallet"
                  className="mt-2"
                />
                {errors.link && (
                  <p className="mt-1 text-sm text-destructive">{errors.link}</p>
                )}
              </div>

              {/* Availability */}
              <div>
                <Label htmlFor="availability">
                  Availability <span className="text-destructive">*</span>
                  {formData.availability?.trim() && (
                    <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) =>
                    setFormData({ ...formData, availability: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in stock">In Stock</SelectItem>
                    <SelectItem value="out of stock">Out of Stock</SelectItem>
                    <SelectItem value="preorder">Pre-order</SelectItem>
                    <SelectItem value="backorder">Backorder</SelectItem>
                  </SelectContent>
                </Select>
                {errors.availability && (
                  <p className="mt-1 text-sm text-destructive">{errors.availability}</p>
                )}
              </div>

              {/* GTIN or Brand */}
              <div className="p-4 rounded-lg bg-secondary space-y-4">
                <p className="text-sm font-medium">
                  <span className="text-destructive">*</span> At least one required:
                </p>

                <div>
                  <Label htmlFor="gtin">
                    GTIN (UPC, EAN, ISBN, etc.)
                    {formData.gtin?.trim() && (
                      <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                    )}
                  </Label>
                  <Input
                    id="gtin"
                    value={formData.gtin}
                    onChange={(e) =>
                      setFormData({ ...formData, gtin: e.target.value })
                    }
                    placeholder="0123456789012"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="brand">
                    Brand
                    {formData.brand?.trim() && (
                      <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />
                    )}
                  </Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Your Brand Name"
                    className="mt-2"
                  />
                </div>

                {errors.gtinOrBrand && (
                  <p className="text-sm text-destructive">{errors.gtinOrBrand}</p>
                )}
              </div>

              {/* Form Error */}
              {errors.form && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{errors.form}</p>
                </div>
              )}

              {/* Save Button */}
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Product
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Info Box */}
          <div className="rounded-lg bg-secondary p-4">
            <p className="text-sm font-medium mb-2">What happens after saving?</p>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  If all required fields are complete, you can enable the product for
                  ChatGPT
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  After enabling, re-submit your feed from the Dashboard to update ChatGPT
                </span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>
                  Your product will then appear in ChatGPT shopping conversations
                </span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
