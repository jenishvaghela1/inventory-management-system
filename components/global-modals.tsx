"use client";

import { CreateProductModal } from "@/components/create-product-modal";
import { CreateInvoiceModal } from "@/components/create-invoice-modal";
import { LowStockModal } from "@/components/low-stock-modal";
import { QRCodeModal } from "@/components/qr-code-modal";
import { EditInstanceModal } from "@/components/edit-instance-modal";

export function GlobalModals() {
  return (
    <>
      <CreateProductModal />
      <CreateInvoiceModal />
      <LowStockModal />
      <QRCodeModal />
      <EditInstanceModal />
      {/* ConfirmDialog is rendered conditionally within components that use it */}
    </>
  );
}
