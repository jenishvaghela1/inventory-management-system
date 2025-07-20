"use client";

import { useState, useEffect, useCallback } from "react";
import { getCategories, addCategory, Category } from "@/lib/database";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger, triggerRefresh } = useApp();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load categories",
      );
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories, refreshTrigger]);

  const createCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "createdAt">) => {
      try {
        const newCategory = await addCategory(categoryData);
        setCategories((prev) => [newCategory, ...prev]);
        triggerRefresh(); // Trigger global refresh
        showToast.success(
          "Category Added",
          "Category has been added successfully",
        );
        return newCategory;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add category";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const refreshCategories = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    refreshCategories,
  };
}
