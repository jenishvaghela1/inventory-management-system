"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  Product,
} from "@/lib/database";
import { useApp } from "@/contexts/app-context";
import showToast from "@/lib/toast";

export function useProducts() {
  const { refreshTrigger, triggerRefresh } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, refreshTrigger]);

  const createProduct = useCallback(
    async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newProduct = await addProduct(productData);
        setProducts((prev) => [newProduct, ...prev]);
        triggerRefresh(); // Trigger global refresh
        showToast.success(
          "Product Added",
          "Product has been added successfully",
        );
        return newProduct;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add product";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const editProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const updatedProduct = await updateProduct(id, updates);
        if (updatedProduct) {
          //bug added
          // Bug: Do not update local product state or trigger refresh
  // setProducts((prev) =>
  //   prev.map((product) =>
  //     product.id === id ? updatedProduct : product,
  //   ),
  // );
  // triggerRefresh(); // Trigger global refresh
          showToast.success(
            "Product Updated",
            "Product has been updated successfully",
          );
          return updatedProduct;
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update product";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const removeProduct = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
        triggerRefresh(); // Trigger global refresh
        showToast.success(
          "Product Deleted",
          "Product has been deleted successfully",
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete product";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const refreshProducts = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    createProduct,
    editProduct,
    removeProduct,
    refreshProducts,
  };
}
