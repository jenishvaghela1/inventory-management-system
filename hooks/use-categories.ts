"use client";

import { useState, useEffect, useCallback } from "react";
import showToast from "@/lib/toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Simple localStorage-based storage for categories
const getCategories = (): Category[] => {
  const categories = localStorage.getItem("categories");
  return categories ? JSON.parse(categories) : [];
};

const saveCategories = (categories: Category[]): void => {
  localStorage.setItem("categories", JSON.stringify(categories));
};

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const categoryList = getCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      showToast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
      try {
        const categories = getCategories();
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        categories.push(newCategory);
        saveCategories(categories);
        fetchCategories();
        showToast.success(
          "Category created successfully",
          `${categoryData.name} has been added`,
        );
        return true;
      } catch (error) {
        console.error("Failed to create category:", error);
        showToast.error("Failed to create category");
        return false;
      }
    },
    [fetchCategories],
  );

  const editCategory = useCallback(
    async (
      id: string,
      categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
    ) => {
      try {
        const categories = getCategories();
        const index = categories.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Category not found");
        }

        categories[index] = {
          ...categories[index],
          ...categoryData,
          updatedAt: new Date().toISOString(),
        };
        saveCategories(categories);
        fetchCategories();
        showToast.success("Category updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to update category:", error);
        showToast.error("Failed to update category");
        return false;
      }
    },
    [fetchCategories],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      try {
        const categories = getCategories();
        const filteredCategories = categories.filter((c) => c.id !== id);
        if (filteredCategories.length === categories.length) {
          throw new Error("Category not found");
        }

        saveCategories(filteredCategories);
        fetchCategories();
        showToast.success("Category deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete category:", error);
        showToast.error("Failed to delete category");
        return false;
      }
    },
    [fetchCategories],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    createCategory,
    editCategory,
    removeCategory,
    fetchCategories,
  };
}
