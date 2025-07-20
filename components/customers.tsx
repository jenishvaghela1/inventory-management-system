"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useCustomers } from "@/hooks/use-customers";
import { useLanguage } from "@/contexts/language-context";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  createdAt: string;
}

export default function Customers() {
  const { customers, createCustomer, editCustomer, removeCustomer } =
    useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await createCustomer(formData);
    if (success) {
      setShowCreateDialog(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    const success = await editCustomer(currentCustomer.id, formData);
    if (success) {
      setShowEditDialog(false);
      setCurrentCustomer(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    const success = await removeCustomer(customerToDelete.id);
    if (success) {
      setShowDeleteDialog(false);
      setCustomerToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
    setShowCreateDialog(true);
  };

  const openEditDialog = (customer: Customer) => {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      address: customer.address,
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setShowDeleteDialog(true);
  };

  const filteredCustomers = customers.filter(
    (customer: Customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderForm = (onSubmit: (e: React.FormEvent) => Promise<void>) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="input-enhanced"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input-enhanced"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="input-enhanced"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className="input-enhanced min-h-[80px]"
          placeholder="123 Main St, City, State, ZIP"
        />
      </div>

      <DialogFooter>
        <Button type="submit" className="w-full btn-enhanced">
          {currentCustomer ? "Update Customer" : "Create Customer"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
                <Users className="h-8 w-8" />
                Customers
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your customer database
              </p>
            </div>
            <Button
              onClick={openCreateDialog}
              className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="animate-in fade-in-up animation-delay-100ms">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-enhanced"
            />
          </div>
        </div>

        {/* Customers Table */}
        <div className="animate-in fade-in-up animation-delay-200ms">
          <div className="table-enhanced">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: Customer, index: number) => (
                  <TableRow
                    key={customer.id}
                    className="animate-in fade-in-up"
                    style={{ animationDelay: `${300 + index * 50}ms` }}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {customer.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div className="max-w-[200px] truncate">
                          {customer.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(customer)}
                          className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(customer)}
                          className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm ? "No customers found" : "No customers yet"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Customer Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          {renderForm(handleCreateCustomer)}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Edit Customer
            </DialogTitle>
          </DialogHeader>
          {renderForm(handleEditCustomer)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] dialog-enhanced">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">
              Delete Customer
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{customerToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
