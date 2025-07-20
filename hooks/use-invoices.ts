"use client";

import { useState, useEffect, useCallback } from "react";
import { getInvoices, createInvoice } from "@/lib/database";
import showToast from "@/lib/toast";

interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  client_address: string;
  date: string;
  total: number;
  items: InvoiceItem[];
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const invoiceList = await getInvoices();
      setInvoices(invoiceList);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      showToast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewInvoice = useCallback(
    async (invoiceData: {
      client_name: string;
      client_email: string;
      client_address: string;
      date: string;
      total: number;
      items: InvoiceItem[];
    }) => {
      try {
        const invoiceId = await createInvoice(invoiceData);
        await fetchInvoices();
        showToast.success(
          "Invoice created successfully",
          `Invoice #${invoiceId} has been created`,
        );
        return invoiceId;
      } catch (error) {
        console.error("Failed to create invoice:", error);
        showToast.error("Failed to create invoice");
        return null;
      }
    },
    [fetchInvoices],
  );

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    fetchInvoices,
    createNewInvoice,
  };
}
