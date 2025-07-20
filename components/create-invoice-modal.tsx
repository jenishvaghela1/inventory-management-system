"use client";

import type React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, User, Calendar, Mail, MapPin } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProducts } from "@/hooks/use-products";
import { useInvoices } from "@/hooks/use-invoices";
import { getCustomers, type Customer } from "@/lib/database";
import { MODAL_TYPES, TAX_RATES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { downloadInvoicePDF } from "@/lib/pdf-generator";
import showToast from "@/lib/toast";

interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const initialFormData = {
  clientName: "",
  clientEmail: "",
  clientAddress: "",
  invoiceDate: new Date().toISOString().split("T")[0],
  selectedProduct: null as string | null,
  quantity: 1,
  tax: TAX_RATES.DEFAULT_VAT,
  discount: 0,
};

export function CreateInvoiceModal() {
  const { activeModal, closeModal, triggerRefresh } = useApp();
  const { products } = useProducts();
  const { createNewInvoice } = useInvoices();

  const [formData, setFormData] = useState(initialFormData);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = activeModal === MODAL_TYPES.CREATE_INVOICE;

  const availableProducts = products.filter((p) => p.quantity > 0);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const customerList = await getCustomers();
      setCustomers(customerList);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "new") {
      setSelectedCustomer(null);
      setFormData({
        ...formData,
        clientName: "",
        clientEmail: "",
        clientAddress: "",
      });
    } else {
      const customer = customers.find((c) => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer.id);
        setFormData({
          ...formData,
          clientName: customer.name,
          clientEmail: customer.email,
          clientAddress: customer.address,
        });
      }
    }
  };

  const handleAddItem = () => {
    if (!formData.selectedProduct || formData.quantity <= 0) {
      showToast.warning(
        "Invalid Selection",
        "Please select a product and enter a valid quantity",
      );
      return;
    }

    const product = products.find((p) => p.id === formData.selectedProduct);
    if (!product) {
      showToast.error(
        "Product Not Found",
        "Selected product could not be found",
      );
      return;
    }

    if (product.quantity < formData.quantity) {
      showToast.warning(
        "Insufficient Stock",
        `Only ${product.quantity} units available`,
      );
      return;
    }

    // Check if product is already in the invoice
    const existingItemIndex = invoiceItems.findIndex(
      (item) => item.product_id === Number.parseInt(product.id),
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...invoiceItems];
      const newQuantity =
        updatedItems[existingItemIndex].quantity + formData.quantity;

      if (newQuantity > product.quantity) {
        showToast.warning(
          "Insufficient Stock",
          `Total quantity would exceed available stock (${product.quantity})`,
        );
        return;
      }

      updatedItems[existingItemIndex].quantity = newQuantity;
      setInvoiceItems(updatedItems);
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        product_id: Number.parseInt(product.id),
        product_name: product.name,
        quantity: formData.quantity,
        unit_price: product.selling_price,
      };
      setInvoiceItems([...invoiceItems, newItem]);
    }

    setFormData({ ...formData, selectedProduct: null, quantity: 1 });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...invoiceItems];
    updatedItems.splice(index, 1);
    setInvoiceItems(updatedItems);
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (formData.tax / 100);
    const discountAmount = subtotal * (formData.discount / 100);
    return subtotal + taxAmount - discountAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (invoiceItems.length === 0) {
      showToast.warning(
        "No Items",
        "Please add at least one item to the invoice",
      );
      return;
    }

    if (!formData.clientName.trim()) {
      showToast.warning("Missing Client Name", "Please enter a client name");
      return;
    }

    if (!formData.clientEmail.trim()) {
      showToast.warning("Missing Client Email", "Please enter a client email");
      return;
    }

    if (!formData.clientAddress.trim()) {
      showToast.warning(
        "Missing Client Address",
        "Please enter a client address",
      );
      return;
    }

    setIsLoading(true);

    try {
      const invoiceData = {
        client_name: formData.clientName.trim(),
        client_email: formData.clientEmail.trim(),
        client_address: formData.clientAddress.trim(),
        date: formData.invoiceDate,
        total: calculateTotal(),
        items: invoiceItems,
      };

      const invoice = await createNewInvoice(invoiceData);

      if (invoice) {
        // Generate PDF
        try {
          await downloadInvoicePDF({
            id: Number.parseInt(invoice.id),
            client_name: formData.clientName.trim(),
            date: formData.invoiceDate,
            items: invoiceItems,
            subtotal: calculateSubtotal(),
            tax: formData.tax,
            discount: formData.discount,
            total: calculateTotal(),
          });
        } catch (error) {
          console.error("Failed to generate PDF:", error);
          showToast.error("Invoice created but PDF generation failed");
        }

        resetForm();
        closeModal();
        triggerRefresh();
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
      showToast.error("Failed to create invoice");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setInvoiceItems([]);
    setSelectedCustomer(null);
  };

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto animate-in scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Create New Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="card-enhanced p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer-select">Select Customer</Label>
                <Select
                  value={selectedCustomer?.toString() || "new"}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger className="input-enhanced">
                    <SelectValue placeholder="Choose existing or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">+ Create New Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer.id.toString()}
                      >
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="invoice-date"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Invoice Date *
                </Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceDate: e.target.value })
                  }
                  required
                  className="input-enhanced"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="client-name"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Client Name *
                </Label>
                <Input
                  id="client-name"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="Enter client name"
                  required
                  className="input-enhanced"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="client-email"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Client Email *
                </Label>
                <Input
                  id="client-email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  placeholder="Enter client email"
                  required
                  className="input-enhanced"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="client-address"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Client Address *
              </Label>
              <Textarea
                id="client-address"
                value={formData.clientAddress}
                onChange={(e) =>
                  setFormData({ ...formData, clientAddress: e.target.value })
                }
                placeholder="Enter client address"
                required
                className="input-enhanced min-h-[80px]"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="card-enhanced p-4 space-y-4">
            <h3 className="text-lg font-semibold">Add Products</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.selectedProduct?.toString() || undefined}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      selectedProduct: value,
                    })
                  }
                >
                  <SelectTrigger className="input-enhanced">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.length === 0 ? (
                      <SelectItem value="no-products" disabled>
                        No products available
                      </SelectItem>
                    ) : (
                      availableProducts.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.name} -{" "}
                          {formatCurrency(product.selling_price)} (
                          {product.quantity} available)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="input-enhanced"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full btn-enhanced"
                  disabled={
                    !formData.selectedProduct || availableProducts.length === 0
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          {invoiceItems.length > 0 && (
            <div className="card-enhanced p-4 space-y-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <div className="table-enhanced">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.quantity * item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="btn-enhanced hover:bg-red-50 hover:border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tax and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-enhanced p-4 space-y-4">
              <h3 className="text-lg font-semibold">Tax & Discount</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tax: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-enhanced"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-enhanced"
                  />
                </div>
              </div>
            </div>

            <div className="card-enhanced p-4 space-y-3">
              <h3 className="text-lg font-semibold">Invoice Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Tax ({formData.tax}%):</span>
                  <span>
                    +
                    {formatCurrency(calculateSubtotal() * (formData.tax / 100))}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount ({formData.discount}%):</span>
                  <span>
                    -
                    {formatCurrency(
                      calculateSubtotal() * (formData.discount / 100),
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xl border-t pt-2">
                  <span>Total:</span>
                  <span className="gradient-text">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={isLoading || invoiceItems.length === 0}
              className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isLoading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
