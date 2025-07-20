"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "@/lib/database";
import showToast from "@/lib/toast";

interface ProductInstance {
  id: string;
  referenceNumber: string;
  status: "available" | "sold" | "reserved";
  soldAt?: string;
  invoiceId?: string;
}

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
  instances?: ProductInstance[];
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productList = getProducts();
      setProducts(productList);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      showToast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(
    async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      try {
        addProduct(productData);
        fetchProducts();
        showToast.success(
          "Product created successfully",
          `${productData.name} has been added to inventory`,
        );
        return true;
      } catch (error) {
        console.error("Failed to create product:", error);
        showToast.error("Failed to create product");
        return false;
      }
    },
    [fetchProducts],
  );

  const editProduct = useCallback(
    async (
      id: string,
      productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
    ) => {
      try {
        await updateProduct(id, productData);
        await fetchProducts();
        showToast.success("Product updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to update product:", error);
        showToast.error("Failed to update product");
        return false;
      }
    },
    [fetchProducts],
  );

  const removeProduct = useCallback(
    async (id: string) => {
      try {
        deleteProduct(id);
        fetchProducts();
        showToast.success("Product deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete product:", error);
        showToast.error("Failed to delete product");
        return false;
      }
    },
    [fetchProducts],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    editProduct,
    removeProduct,
  };
}
