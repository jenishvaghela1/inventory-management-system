"use client";

import { useState, useEffect, useCallback } from "react";
import showToast from "@/lib/toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address: string;
  createdAt: string;
}

// Simple localStorage-based storage for customers
const getCustomers = (): Customer[] => {
  const customers = localStorage.getItem("customers");
  return customers ? JSON.parse(customers) : [];
};

const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem("customers", JSON.stringify(customers));
};

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const customerList = getCustomers();
      setCustomers(customerList);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      showToast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(
    async (customerData: Omit<Customer, "id" | "createdAt">) => {
      try {
        const customers = getCustomers();
        const newCustomer: Customer = {
          ...customerData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        customers.push(newCustomer);
        saveCustomers(customers);
        fetchCustomers();
        showToast.success(
          "Customer created successfully",
          `${customerData.name} has been added`
        );
        return true;
      } catch (error) {
        console.error("Failed to create customer:", error);
        showToast.error("Failed to create customer");
        return false;
      }
    },
    [fetchCustomers]
  );

  const editCustomer = useCallback(
    async (
      id: string,
      customerData: Omit<Customer, "id" | "createdAt">
    ) => {
      try {
        const customers = getCustomers();
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) {
          throw new Error("Customer not found");
        }

        customers[index] = {
          ...customers[index],
          ...customerData,
        };
        saveCustomers(customers);
        fetchCustomers();
        showToast.success("Customer updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to update customer:", error);
        showToast.error("Failed to update customer");
        return false;
      }
    },
    [fetchCustomers]
  );

  const removeCustomer = useCallback(
    async (id: string) => {
      try {
        const customers = getCustomers();
        const filteredCustomers = customers.filter((c) => c.id !== id);
        if (filteredCustomers.length === customers.length) {
          throw new Error("Customer not found");
        }

        saveCustomers(filteredCustomers);
        fetchCustomers();
        showToast.success("Customer deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete customer:", error);
        showToast.error("Failed to delete customer");
        return false;
      }
    },
    [fetchCustomers]
  );

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    loading,
    createCustomer,
    editCustomer,
    removeCustomer,
    fetchCustomers,
  };
}
