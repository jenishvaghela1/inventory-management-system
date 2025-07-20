"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/lib/database";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/database";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger, triggerRefresh } = useApp();

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers, refreshTrigger]);

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, "id" | "createdAt">) => {
      try {
        const newCustomer = await addCustomer(customerData);
        setCustomers((prev) => [newCustomer, ...prev]);
        triggerRefresh(); // Trigger global refresh
        showToast.success(
          "Customer Added",
          "Customer has been added successfully",
        );
        return newCustomer;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to add customer";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const editCustomer = useCallback(
    async (id: string, updates: Partial<Customer>) => {
      try {
        const updatedCustomer = await updateCustomer(id, updates);
        if (updatedCustomer) {
          setCustomers((prev) =>
            prev.map((customer) =>
              customer.id === id ? updatedCustomer : customer,
            ),
          );
          triggerRefresh(); // Trigger global refresh
          showToast.success(
            "Customer Updated",
            "Customer has been updated successfully",
          );
          return updatedCustomer;
        } else {
          throw new Error("Customer not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update customer";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const removeCustomer = useCallback(
    async (id: string) => {
      try {
        const success = await deleteCustomer(id);
        if (success) {
          setCustomers((prev) => prev.filter((customer) => customer.id !== id));
          triggerRefresh(); // Trigger global refresh
          showToast.success(
            "Customer Deleted",
            "Customer has been deleted successfully",
          );
          return true;
        } else {
          throw new Error("Customer not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete customer";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const refreshCustomers = useCallback(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    loading,
    error,
    createCustomer,
    editCustomer,
    removeCustomer,
    refreshCustomers,
  };
}

// Named export
export { useCustomers };

// Also export as default
export default useCustomers;
