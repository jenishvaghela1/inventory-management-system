"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  Invoice,
} from "@/lib/database";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger, triggerRefresh } = useApp();

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, refreshTrigger]);

  const createInvoice = useCallback(
    async (invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newInvoice = await addInvoice(invoiceData);
        setInvoices((prev) => [newInvoice, ...prev]);
        triggerRefresh(); // Trigger global refresh
        showToast.success(
          "Invoice Created",
          "Invoice has been created successfully",
        );
        return newInvoice;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create invoice";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const editInvoice = useCallback(
    async (id: string, updates: Partial<Invoice>) => {
      try {
        const updatedInvoice = await updateInvoice(id, updates);
        if (updatedInvoice) {
          setInvoices((prev) =>
            prev.map((invoice) =>
              invoice.id === id ? updatedInvoice : invoice,
            ),
          );
          triggerRefresh(); // Trigger global refresh
          showToast.success(
            "Invoice Updated",
            "Invoice has been updated successfully",
          );
          return updatedInvoice;
        } else {
          throw new Error("Invoice not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update invoice";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const removeInvoice = useCallback(
    async (id: string) => {
      try {
        const success = await deleteInvoice(id);
        if (success) {
          setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
          triggerRefresh(); // Trigger global refresh
          showToast.success(
            "Invoice Deleted",
            "Invoice has been deleted successfully",
          );
          return true;
        } else {
          throw new Error("Invoice not found");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete invoice";
        setError(message);
        showToast.error("Error", message);
        throw err;
      }
    },
    [triggerRefresh],
  );

  const refreshInvoices = useCallback(() => {
    loadInvoices();
  }, [loadInvoices]);

  return {
    invoices,
    loading,
    error,
    createInvoice,
    editInvoice,
    removeInvoice,
    refreshInvoices,
  };
}
