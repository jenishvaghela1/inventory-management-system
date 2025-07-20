"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  FileText,
  QrCode,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  TrendingUp,
  Sparkles,
  Package,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/app-context";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/utils";
import { MODAL_TYPES } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";
import { useSettings } from "@/contexts/settings-context";

interface Product {
  id: string;
  reference: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  status?: "active" | "inactive" | "discontinued";
  instances?: Array<{
    id: string;
    referenceNumber: string;
    status: "available" | "sold" | "reserved";
  }>;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export default function Products() {
  const { openModal, triggerRefresh } = useApp();
  const { products, editProduct, removeProduct } = useProducts();
  const { categories } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );
  const { t } = useLanguage();
  const { getCurrencyInfo } = useSettings();

  const [formData, setFormData] = useState({
    reference: "",
    name: "",
    description: "",
    category: "",
    quantity: 0,
    purchase_price: 0,
    selling_price: 0,
    status: "active" as "active" | "inactive" | "discontinued",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "reference" ||
        name === "name" ||
        name === "description" ||
        name === "category" ||
        name === "status"
          ? value
          : Number.parseFloat(value) || 0,
    }));
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    try {
      const productData = {
        ...formData,
        lowStockThreshold: currentProduct.lowStockThreshold || 5,
        instances: currentProduct.instances,
      };
      await editProduct(currentProduct.id, productData);
      setShowEditDialog(false);
      setCurrentProduct(null);
      setFormData({
        reference: "",
        name: "",
        description: "",
        category: "",
        quantity: 0,
        purchase_price: 0,
        selling_price: 0,
        status: "active",
      });
      triggerRefresh();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await removeProduct(productToDelete.id);
      setShowDeleteDialog(false);
      setProductToDelete(null);
      triggerRefresh();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      reference: product.reference,
      name: product.name,
      description: product.description || "",
      category: product.category || "",
      quantity: product.quantity,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      status: product.status || "active",
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return t("products.outOfStock");
    if (quantity <= 10) return t("products.lowStock");
    return t("products.inStock");
  };

  const getStockStatusColor = (status: string) => {
    const outOfStock = t("products.outOfStock");
    const lowStock = t("products.lowStock");

    if (status === outOfStock) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    if (status === lowStock) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" &&
        (product.status === "active" || !product.status)) ||
      (statusFilter === "inactive" && product.status === "inactive") ||
      (statusFilter === "discontinued" && product.status === "discontinued") ||
      (statusFilter === "with-instances" &&
        product.instances &&
        product.instances.length > 0) ||
      (statusFilter === "without-instances" &&
        (!product.instances || product.instances.length === 0));

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "uncategorized" &&
        (!product.category || product.category === "")) ||
      product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const renderForm = (onSubmit: (e: React.FormEvent) => Promise<void>) => (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reference">{t("products.reference")}</Label>
          <Input
            id="reference"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
            required
            className="input-enhanced"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t("products.name")}</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="input-enhanced"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category || "none"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                category: value === "none" ? "" : value,
              })
            }
          >
            <SelectTrigger className="input-enhanced">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                status: value as "active" | "inactive" | "discontinued",
              })
            }
          >
            <SelectTrigger className="input-enhanced">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Active
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Inactive
                </div>
              </SelectItem>
              <SelectItem value="discontinued">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Discontinued
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase_price">
            {t("products.purchasePrice")} ({getCurrencyInfo().CODE})
          </Label>
          <Input
            id="purchase_price"
            name="purchase_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchase_price}
            onChange={handleInputChange}
            required
            className="input-enhanced"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="selling_price">
            {t("products.sellingPrice")} ({getCurrencyInfo().CODE})
          </Label>
          <Input
            id="selling_price"
            name="selling_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.selling_price}
            onChange={handleInputChange}
            required
            className="input-enhanced"
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="input-enhanced"
            placeholder="Product description..."
          />
        </div>

        {/* Instance Information (Read-only in edit mode) */}
        {currentProduct?.instances && currentProduct.instances.length > 0 && (
          <div className="col-span-2 space-y-2">
            <Label>Product Instances</Label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">
                This product has {currentProduct.instances.length} individual
                instances. Use the main products table to manage individual
                instances.
              </div>
              <div className="flex flex-wrap gap-2">
                {currentProduct.instances.slice(0, 5).map((instance, index) => (
                  <span
                    key={instance.id}
                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                  >
                    {instance.referenceNumber}
                  </span>
                ))}
                {currentProduct.instances.length > 5 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                    +{currentProduct.instances.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quantity field only for products without instances */}
        {(!currentProduct?.instances ||
          currentProduct.instances.length === 0) && (
          <div className="col-span-2 space-y-2">
            <Label htmlFor="quantity">{t("products.quantity")}</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              className="input-enhanced"
            />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button type="submit" className="w-full btn-enhanced">
          {t("common.save")}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-8 ">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <Package className="h-8 w-8" />
                {t("products.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("products.subtitle")}
              </p>
            </div>
            <Button
              onClick={() => openModal(MODAL_TYPES.CREATE_PRODUCT)}
              className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              {t("products.addProduct")}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in-up animation-delay-50ms"
          style={{ animationDelay: "50ms" }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {products.length}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Active Products
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {
                    products.filter((p) => p.status === "active" || !p.status)
                      .length
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  With Instances
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {
                    products.filter(
                      (p) => p.instances && p.instances.length > 0,
                    ).length
                  }
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-amber-900">
                  {
                    products.filter((p) => {
                      if (p.instances && p.instances.length > 0) {
                        return (
                          p.instances.filter((i) => i.status === "available")
                            .length <= (p.lowStockThreshold || 5)
                        );
                      }
                      return p.quantity <= (p.lowStockThreshold || 5);
                    }).length
                  }
                </p>
              </div>
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                !
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div
          className="animate-in fade-in-up animation-delay-100ms space-y-4"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, reference, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-enhanced"
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                  <SelectItem value="with-instances">With Instances</SelectItem>
                  <SelectItem value="without-instances">
                    Without Instances
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredProducts.length} of {products.length} products
              {(statusFilter !== "all" ||
                categoryFilter !== "all" ||
                searchTerm) &&
                " (filtered)"}
            </span>

            {/* Expand/Collapse Controls */}
            {filteredProducts.some(
              (p) => p.instances && p.instances.length > 0,
            ) && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const productsWithInstances = filteredProducts
                      .filter((p) => p.instances && p.instances.length > 0)
                      .map((p) => p.id);
                    setExpandedProducts(new Set(productsWithInstances));
                  }}
                  className="text-xs"
                >
                  Expand All Instances
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedProducts(new Set())}
                  className="text-xs"
                >
                  Collapse All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div
          className="animate-in fade-in-up animation-delay-200ms"
          style={{ animationDelay: "200ms" }}
        >
          <div className="table-enhanced">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products.reference")}</TableHead>
                  <TableHead>{t("products.name")}</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    {t("products.stock")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("products.purchasePrice")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("products.sellingPrice")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("common.status")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("products.stock")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product.quantity);
                  const hasInstances =
                    product.instances && product.instances.length > 0;
                  const isExpanded = expandedProducts.has(product.id);
                  const availableInstances = hasInstances
                    ? product.instances!.filter((i) => i.status === "available")
                        .length
                    : product.quantity;

                  return (
                    <React.Fragment key={product.id}>
                      {/* Main Product Row */}
                      <TableRow
                        className="animate-in fade-in-up"
                        style={{ animationDelay: `${300 + index * 50}ms` }}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {hasInstances && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleProductExpansion(product.id)
                                }
                                className="p-0 h-auto w-auto hover:bg-transparent"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <div>
                              <div>{product.reference}</div>
                              {hasInstances && (
                                <div className="text-xs text-muted-foreground">
                                  {product.instances!.length} instances
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category && (
                            <span className="px-2 py-1 bg-muted rounded-md text-xs">
                              {product.category}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div>
                            <div className="font-medium">
                              {hasInstances
                                ? `${availableInstances}/${product.instances!.length}`
                                : product.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {hasInstances ? "available/total" : "in stock"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            product.purchase_price,
                            getCurrencyInfo().CODE,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            product.selling_price,
                            getCurrencyInfo().CODE,
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : product.status === "inactive"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status || "active"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${getStockStatusColor(stockStatus)}`}
                          >
                            {stockStatus}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!hasInstances && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openModal(MODAL_TYPES.QR_CODE, product)
                                }
                                className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                title="Generate QR Code"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                              title="Edit Product"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(product)}
                              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Instance Rows (shown when expanded) */}
                      {hasInstances &&
                        isExpanded &&
                        product.instances!.map((instance, instanceIndex) => (
                          <TableRow
                            key={`${product.id}-${instance.id}`}
                            className="bg-muted/30 border-l-4 border-l-primary/20"
                          >
                            <TableCell className="pl-12">
                              <div className="text-sm">
                                <div className="font-mono">
                                  {instance.referenceNumber}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Instance #{instanceIndex + 1}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                Same as main product
                              </div>
                            </TableCell>
                            <TableCell>{/* Empty for instances */}</TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  instance.status === "available"
                                    ? "bg-green-100 text-green-800"
                                    : instance.status === "sold"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {instance.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              Same as main
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              Same as main
                            </TableCell>
                            <TableCell>{/* Empty for instances */}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openModal(MODAL_TYPES.QR_CODE, {
                                      ...product,
                                      reference: instance.referenceNumber,
                                      instanceId: instance.id,
                                    })
                                  }
                                  className="hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                                  title="Generate QR Code for this instance"
                                >
                                  <Package className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    openModal(MODAL_TYPES.EDIT_INSTANCE, {
                                      product,
                                      instance,
                                      instanceIndex,
                                    })
                                  }
                                  className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                                  title="Edit this instance"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </React.Fragment>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                        <div>
                          <p className="text-lg font-medium text-muted-foreground">
                            {products.length === 0
                              ? "No products yet"
                              : "No products match your filters"}
                          </p>
                          <p className="text-sm text-muted-foreground/80">
                            {products.length === 0
                              ? "Create your first product to get started"
                              : "Try adjusting your search or filter criteria"}
                          </p>
                        </div>
                        {products.length === 0 && (
                          <Button
                            onClick={() =>
                              openModal(MODAL_TYPES.CREATE_PRODUCT)
                            }
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Product
                          </Button>
                        )}
                        {products.length > 0 &&
                          filteredProducts.length === 0 && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setCategoryFilter("all");
                              }}
                              className="mt-2"
                            >
                              Clear Filters
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              {t("products.editProduct")}
            </DialogTitle>
            <DialogDescription>
              {t("products.editDescription")}
            </DialogDescription>
          </DialogHeader>
          {renderForm(handleEditProduct)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">
              {t("common.confirmDelete")}
            </DialogTitle>
            <DialogDescription>
              {`${t("common.deleteWarning")} "${productToDelete?.name}". ${t("common.undoWarning")}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
