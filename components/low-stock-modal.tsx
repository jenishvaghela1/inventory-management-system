"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProducts } from "@/hooks/use-products";
import { MODAL_TYPES, STOCK_THRESHOLDS } from "@/lib/constants";
import { getStockStatus, getStockStatusColor } from "@/lib/utils";

export function LowStockModal() {
  const { activeModal, closeModal, openModal } = useApp();
  const { products } = useProducts();

  const isOpen = activeModal === MODAL_TYPES.LOW_STOCK;

  const lowStockProducts = products.filter(
    (product) => product.quantity <= STOCK_THRESHOLDS.LOW_STOCK,
  );

  const handleRestock = () => {
    closeModal();
    openModal(MODAL_TYPES.CREATE_PRODUCT);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Stock Alert
          </DialogTitle>
        </DialogHeader>

        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              All products are well stocked!
            </p>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              The following products have low stock (≤
              {STOCK_THRESHOLDS.LOW_STOCK} units):
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const status = getStockStatus(product.quantity);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.reference}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">
                          {product.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStockStatusColor(status)}`}
                          >
                            {status === "out" ? "Out of Stock" : "Low Stock"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button onClick={handleRestock}>Add New Product</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
