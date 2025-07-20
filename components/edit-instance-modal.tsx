"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/contexts/app-context";
import { useProducts } from "@/hooks/use-products";
import { MODAL_TYPES } from "@/lib/constants";
import { Package } from "lucide-react";
import showToast from "@/lib/toast";

interface ProductInstance {
  id: string;
  referenceNumber: string;
  status: "available" | "sold" | "reserved";
  soldAt?: string;
  invoiceId?: string;
}

interface Product {
  id: string;
  reference: string;
  name: string;
  instances?: ProductInstance[];
}

interface EditInstanceModalData {
  product: Product;
  instance: ProductInstance;
  instanceIndex: number;
}

export function EditInstanceModal() {
  const { activeModal, modalData, closeModal, triggerRefresh } = useApp();
  const { editProduct, products } = useProducts();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    referenceNumber: "",
    status: "available" as "available" | "sold" | "reserved",
  });

  const isOpen = activeModal === MODAL_TYPES.EDIT_INSTANCE;
  const data = modalData as EditInstanceModalData | null;

  useEffect(() => {
    if (isOpen && data) {
      setFormData({
        referenceNumber: data.instance.referenceNumber,
        status: data.instance.status,
      });
    }
  }, [isOpen, data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value as "available" | "sold" | "reserved",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setIsLoading(true);

    try {
      // Get the complete product data from the products list
      const fullProduct = products.find((p) => p.id === data.product.id);
      if (!fullProduct) {
        throw new Error("Product not found");
      }

      // Update the specific instance
      const updatedInstances = [...(fullProduct.instances || [])];
      updatedInstances[data.instanceIndex] = {
        ...data.instance,
        referenceNumber: formData.referenceNumber,
        status: formData.status,
        ...(formData.status === "sold" &&
          !data.instance.soldAt && {
            soldAt: new Date().toISOString(),
          }),
      };

      // Prepare the complete product data
      const productData = {
        reference: fullProduct.reference,
        name: fullProduct.name,
        description: fullProduct.description || "",
        category: fullProduct.category,
        quantity: fullProduct.quantity,
        purchase_price: fullProduct.purchase_price,
        selling_price: fullProduct.selling_price,
        lowStockThreshold: fullProduct.lowStockThreshold,
        instances: updatedInstances,
      };

      const success = await editProduct(fullProduct.id, productData);

      if (success) {
        showToast.success("Instance updated successfully");
        closeModal();
        triggerRefresh();
      }
    } catch (error) {
      console.error("Failed to update instance:", error);
      showToast.error("Failed to update instance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      referenceNumber: "",
      status: "available",
    });
    closeModal();
  };

  if (!data || !data.product || !data.instance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md animate-in scale-in">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Edit Product Instance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Product</Label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="font-medium">
                {data?.product?.name || "Unknown Product"}
              </div>
              <div className="text-sm text-muted-foreground">
                Main Reference: {data?.product?.reference || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber" className="text-sm font-medium">
              Instance Reference Number *
            </Label>
            <Input
              id="referenceNumber"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter unique reference number"
              className="input-enhanced"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="input-enhanced">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.referenceNumber.trim()}
              className="btn-enhanced"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                "Update Instance"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
