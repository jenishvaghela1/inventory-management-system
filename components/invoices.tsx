"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Eye, FileText, Plus } from "lucide-react";
import { useInvoices } from "@/hooks/use-invoices";
import { generatePDF, downloadInvoicePDF } from "@/lib/pdf-generator";
import { useApp } from "@/contexts/app-context";
import { MODAL_TYPES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useLanguage } from "@/contexts/language-context";
import { useSettings } from "@/contexts/settings-context";

interface Invoice {
  id: number;
  client_name: string;
  client_email: string;
  client_address: string;
  date: string;
  total: number;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
  }[];
}

export default function Invoices() {
  const { invoices, loading, fetchInvoices } = useInvoices();
  const { openModal } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const { t } = useLanguage();
  const { getCurrencyInfo } = useSettings();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleViewInvoice = async (invoice: Invoice) => {
    setPdfLoading(true);
    try {
      await generatePDF({
        id: invoice.id,
        client_name: invoice.client_name,
        date: invoice.date,
        items: invoice.items,
        subtotal: invoice.items.reduce(
          (sum, item) => sum + item.quantity * item.unit_price,
          0,
        ),
        tax: 0,
        discount: 0,
        total: invoice.total,
      });
      showToast.success("Invoice preview generated");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      showToast.error("Failed to generate invoice preview");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    setPdfLoading(true);
    try {
      await downloadInvoicePDF({
        id: invoice.id,
        client_name: invoice.client_name,
        date: invoice.date,
        items: invoice.items,
        subtotal: invoice.items.reduce(
          (sum, item) => sum + item.quantity * item.unit_price,
          0,
        ),
        tax: 0,
        discount: 0,
        total: invoice.total,
      });
      showToast.success("Invoice PDF downloaded and print dialog opened");
    } catch (error) {
      console.error("Failed to download PDF:", error);
      showToast.error("Failed to download invoice PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.client_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const invoiceDate = new Date(invoice.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDateRange =
      (!start || invoiceDate >= start) && (!end || invoiceDate <= end);

    return matchesSearch && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="loading-spinner h-12 w-12 mx-auto" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <FileText className="h-8 w-8" />
                {t("invoices.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("invoices.subtitle")}
              </p>
            </div>
            <Button
              onClick={() => openModal(MODAL_TYPES.CREATE_INVOICE)}
              className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              {t("invoices.createInvoice")}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div
          className="animate-in fade-in-up animation-delay-100ms"
          style={{ animationDelay: "100ms" }}
        >
          <div className="card-enhanced p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("invoices.searchPlaceholder")}
                  className="pl-10 input-enhanced"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                  className="input-enhanced"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                  className="input-enhanced"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div
          className="animate-in fade-in-up animation-delay-200ms"
          style={{ animationDelay: "200ms" }}
        >
          <div className="table-enhanced">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoices.invoiceId")}</TableHead>
                  <TableHead>{t("invoices.clientName")}</TableHead>
                  <TableHead>{t("invoices.email")}</TableHead>
                  <TableHead>{t("invoices.date")}</TableHead>
                  <TableHead>{t("invoices.itemsCount")}</TableHead>
                  <TableHead className="text-right">
                    {t("invoices.total")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("common.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => (
                  <TableRow
                    key={invoice.id}
                    className="animate-in fade-in-up"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <TableCell className="font-medium">#{invoice.id}</TableCell>
                    <TableCell>{invoice.client_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.client_email || t("common.notAvailable")}
                    </TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>
                      {invoice.items.length} {t("invoices.items")}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total, getCurrencyInfo().CODE)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                          disabled={pdfLoading}
                          className="btn-enhanced hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          {t("common.view")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={pdfLoading}
                          className="btn-enhanced hover:bg-green-50 hover:border-green-200"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t("invoices.downloadPdf")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="text-muted-foreground">
                        {invoices.length === 0
                          ? t("invoices.noInvoices")
                          : t("invoices.noResults")}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {pdfLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
            <div className="bg-card p-6 rounded-xl shadow-xl card-enhanced">
              <div className="flex items-center space-x-3">
                <div className="loading-spinner h-6 w-6" />
                <span>{t("invoices.generatingPdf")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
