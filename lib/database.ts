// Simple localStorage-based database for browser compatibility

export interface ProductInstance {
  id: string;
  referenceNumber: string;
  status: "available" | "sold" | "reserved";
  soldAt?: string;
  invoiceId?: string;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  purchase_price: number;
  selling_price: number;
  status?: "active" | "inactive" | "discontinued";
  instances?: ProductInstance[];
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  instanceIds?: string[]; // For tracking individual product instances
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

// Products
export const getProducts = (): Product[] => {
  const products = localStorage.getItem("products");
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem("products", JSON.stringify(products));
};

export const addProduct = (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Product => {
  const products = getProducts();

  // Generate instances if they're provided
  const instances = product.instances || [];

  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    lowStockThreshold: 5, // Default low stock threshold
    instances,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (
  id: string,
  updates: Partial<Product>,
): Product | null => {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveProducts(products);
  return products[index];
};

export const deleteProduct = (id: string): boolean => {
  const products = getProducts();
  const filteredProducts = products.filter((p) => p.id !== id);
  if (filteredProducts.length === products.length) return false;

  saveProducts(filteredProducts);
  return true;
};

// Invoices
export const getInvoices = (): Invoice[] => {
  const invoices = localStorage.getItem("invoices");
  return invoices ? JSON.parse(invoices) : [];
};

export const saveInvoices = (invoices: Invoice[]): void => {
  localStorage.setItem("invoices", JSON.stringify(invoices));
};

export const addInvoice = (
  invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
): Invoice => {
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
};

export const updateInvoice = (
  id: string,
  updates: Partial<Invoice>,
): Invoice | null => {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === id);
  if (index === -1) return null;

  invoices[index] = {
    ...invoices[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveInvoices(invoices);
  return invoices[index];
};

export const deleteInvoice = (id: string): boolean => {
  const invoices = getInvoices();
  const filteredInvoices = invoices.filter((i) => i.id !== id);
  if (filteredInvoices.length === invoices.length) return false;

  saveInvoices(filteredInvoices);
  return true;
};

// Customer management functions
export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  createdAt: string;
}

export const getCustomers = (): Customer[] => {
  const customers = localStorage.getItem("customers");
  return customers ? JSON.parse(customers) : [];
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem("customers", JSON.stringify(customers));
};

export const addCustomer = (
  customer: Omit<Customer, "id" | "createdAt">,
): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

// Alternative function name for backward compatibility
export const createInvoice = addInvoice;

// Dashboard statistics
export interface DashboardStats {
  productCount: number;
  totalStock: number;
  totalRevenue: number;
  totalInvoices: number;
  lowStockProducts: number;
  recentSales: number;
}

export const getDashboardStats = (): DashboardStats => {
  const products = getProducts();
  const invoices = getInvoices();

  const productCount = products.length;
  const totalStock = products.reduce(
    (sum, product) => sum + product.quantity,
    0,
  );
  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const totalInvoices = invoices.length;
  const lowStockProducts = products.filter(
    (product) => product.quantity <= product.lowStockThreshold,
  ).length;

  // Recent sales (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = invoices
    .filter(
      (invoice) =>
        new Date(invoice.createdAt) >= thirtyDaysAgo &&
        invoice.status === "paid",
    )
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return {
    productCount,
    totalStock,
    totalRevenue,
    totalInvoices,
    lowStockProducts,
    recentSales,
  };
};

// Database management
export const exportDatabase = async (): Promise<void> => {
  const data = {
    products: getProducts(),
    invoices: getInvoices(),
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.products) saveProducts(data.products);
          if (data.invoices) saveInvoices(data.invoices);
          resolve();
        } catch (error) {
          reject(new Error("Invalid file format"));
        }
      };
      reader.readAsText(file);
    };

    input.click();
  });
};
