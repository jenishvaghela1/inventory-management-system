"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { getInvoices } from "@/lib/database";
import { generatePDF } from "@/lib/pdf-generator";
import { useApp } from "@/contexts/app-context";
import { formatCurrencyWithSymbol, formatDate } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useSettings } from "@/contexts/settings-context";
import type { Invoice } from "@/lib/database";

export function RecentInvoices() {
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();
  const { getCurrencyInfo } = useSettings();

  useEffect(() => {
    fetchRecentInvoices();
  }, [refreshTrigger]);

  const fetchRecentInvoices = async () => {
    try {
      setLoading(true);
      const invoices = await getInvoices();
      const recent = invoices
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);
      setRecentInvoices(recent);
    } catch (error) {
      console.error("Failed to fetch recent invoices:", error);
      showToast.error("Failed to load recent invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      await generatePDF({
        id: Number.parseInt(invoice.id),
        client_name: invoice.customerName,
        date: invoice.createdAt,
        items: invoice.items.map((item) => ({
          product_id: Number.parseInt(item.productId),
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        discount: 0,
        total: invoice.total,
        currency: getCurrencyInfo().CODE,
      });
      showToast.success("Invoice preview generated");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      showToast.error("Failed to generate invoice preview");
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invoices created yet
          </div>
        ) : (
          <div className="table-enhanced">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">#{invoice.id}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyWithSymbol(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                        className="btn-enhanced"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
