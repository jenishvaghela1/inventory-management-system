// Database abstraction layer - supports both localStorage (browser) and SQLite (Electron)

// Declare the electronAPI global
declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      getProducts: () => Promise<Product[]>;
      addProduct: (
        product: Omit<Product, "id" | "createdAt" | "updatedAt">,
      ) => Promise<Product>;
      updateProduct: (
        id: string,
        updates: Partial<Product>,
      ) => Promise<Product | null>;
      deleteProduct: (id: string) => Promise<boolean>;
      getInvoices: () => Promise<Invoice[]>;
      addInvoice: (
        invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
      ) => Promise<Invoice>;
      updateInvoice: (
        id: string,
        updates: Partial<Invoice>,
      ) => Promise<Invoice | null>;
      deleteInvoice: (id: string) => Promise<boolean>;
      getCustomers: () => Promise<Customer[]>;
      addCustomer: (
        customer: Omit<Customer, "id" | "createdAt">,
      ) => Promise<Customer>;
      updateCustomer: (
        id: string,
        updates: Partial<Customer>,
      ) => Promise<Customer | null>;
      deleteCustomer: (id: string) => Promise<boolean>;
      getCategories: () => Promise<Category[]>;
      addCategory: (
        category: Omit<Category, "id" | "createdAt">,
      ) => Promise<Category>;
      getDashboardStats: () => Promise<DashboardStats>;
      backup: () => Promise<{ dbBackup?: string; jsonBackup?: string }>;
      getDatabasePath: () => Promise<string>;
      migrateFromLocalStorage: (data: any) => Promise<void>;
      exportData: () => Promise<any>;
      importData: (data: any) => Promise<void>;
    };
  }
}

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

export interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface DashboardStats {
  productCount: number;
  totalStock: number;
  totalRevenue: number;
  totalInvoices: number;
  lowStockProducts: number;
  recentSales: number;
}

// Check if running in Electron
const isElectron = () => {
  return (
    typeof window !== "undefined" && window.electronAPI?.isElectron === true
  );
};

// One-time migration flag
let migrationChecked = false;

// Check and migrate localStorage data to SQLite if needed
const checkAndMigrate = async () => {
  if (migrationChecked || !isElectron()) return;

  migrationChecked = true;

  try {
    // Check if there's localStorage data to migrate
    const localProducts = localStorage.getItem("products");
    const localInvoices = localStorage.getItem("invoices");
    const localCustomers = localStorage.getItem("customers");
    const localCategories = localStorage.getItem("categories");

    if (localProducts || localInvoices || localCustomers || localCategories) {
      console.log("Found localStorage data, migrating to SQLite...");

      const migrationData: any = {};

      if (localProducts) {
        migrationData.products = JSON.parse(localProducts);
      }
      if (localInvoices) {
        migrationData.invoices = JSON.parse(localInvoices);
      }
      if (localCustomers) {
        migrationData.customers = JSON.parse(localCustomers);
      }
      if (localCategories) {
        migrationData.categories = JSON.parse(localCategories);
      }

      await window.electronAPI!.migrateFromLocalStorage(migrationData);

      // Clear localStorage after successful migration
      localStorage.removeItem("products");
      localStorage.removeItem("invoices");
      localStorage.removeItem("customers");
      localStorage.removeItem("categories");

      console.log("Migration completed successfully");
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

// Products - localStorage implementation
export const getProducts = async (): Promise<Product[]> => {
  if (isElectron()) {
    await checkAndMigrate();
    return window.electronAPI!.getProducts();
  }

  const products = localStorage.getItem("products");
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products: Product[]): void => {
  if (isElectron()) {
    // In Electron, individual operations are used instead of bulk save
    console.warn("saveProducts should not be called in Electron mode");
    return;
  }
  localStorage.setItem("products", JSON.stringify(products));
};

export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> => {
  if (isElectron()) {
    await checkAndMigrate();
    return window.electronAPI!.addProduct(product);
  }

  const products = await getProducts();

  // Generate instances if they're provided
  const instances = product.instances || [];

  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    lowStockThreshold: product.lowStockThreshold || 5,
    instances,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>,
): Promise<Product | null> => {
  if (isElectron()) {
    //bug added
    // Simulate race window before update is applied
    await new Promise(resolve => setTimeout(resolve, 150));
    return window.electronAPI!.updateProduct(id, updates);

  }

  const products = await getProducts();
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

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isElectron()) {
    return window.electronAPI!.deleteProduct(id);
  }

  const products = await getProducts();
  const filteredProducts = products.filter((p) => p.id !== id);
  if (filteredProducts.length === products.length) return false;

  saveProducts(filteredProducts);
  return true;
};

// Invoices - localStorage implementation
export const getInvoices = async (): Promise<Invoice[]> => {
  if (isElectron()) {
    await checkAndMigrate();
    return window.electronAPI!.getInvoices();
  }

  const invoices = localStorage.getItem("invoices");
  return invoices ? JSON.parse(invoices) : [];
};

export const saveInvoices = (invoices: Invoice[]): void => {
  if (isElectron()) {
    console.warn("saveInvoices should not be called in Electron mode");
    return;
  }
  localStorage.setItem("invoices", JSON.stringify(invoices));
};

export const addInvoice = async (
  invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">,
): Promise<Invoice> => {
  if (isElectron()) {
    return window.electronAPI!.addInvoice(invoice);
  }

  const invoices = await getInvoices();
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

export const updateInvoice = async (
  id: string,
  updates: Partial<Invoice>,
): Promise<Invoice | null> => {
  if (isElectron()) {
    return window.electronAPI!.updateInvoice(id, updates);
  }

  const invoices = await getInvoices();
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

export const deleteInvoice = async (id: string): Promise<boolean> => {
  if (isElectron()) {
    return window.electronAPI!.deleteInvoice(id);
  }

  const invoices = await getInvoices();
  const filteredInvoices = invoices.filter((i) => i.id !== id);
  if (filteredInvoices.length === invoices.length) return false;

  saveInvoices(filteredInvoices);
  return true;
};

// Customer management functions
export const getCustomers = async (): Promise<Customer[]> => {
  if (isElectron()) {
    await checkAndMigrate();
    return window.electronAPI!.getCustomers();
  }

  const customers = localStorage.getItem("customers");
  return customers ? JSON.parse(customers) : [];
};

export const saveCustomers = (customers: Customer[]): void => {
  if (isElectron()) {
    console.warn("saveCustomers should not be called in Electron mode");
    return;
  }
  localStorage.setItem("customers", JSON.stringify(customers));
};

export const addCustomer = async (
  customer: Omit<Customer, "id" | "createdAt">,
): Promise<Customer> => {
  if (isElectron()) {
    return window.electronAPI!.addCustomer(customer);
  }

  const customers = await getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

export const updateCustomer = async (
  id: string,
  updates: Partial<Customer>,
): Promise<Customer | null> => {
  if (isElectron()) {
    return window.electronAPI!.updateCustomer(id, updates);
  }

  const customers = await getCustomers();
  const index = customers.findIndex((c) => c.id === id);
  if (index === -1) return null;

  customers[index] = {
    ...customers[index],
    ...updates,
  };
  saveCustomers(customers);
  return customers[index];
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  if (isElectron()) {
    return window.electronAPI!.deleteCustomer(id);
  }

  const customers = await getCustomers();
  const filteredCustomers = customers.filter((c) => c.id !== id);
  if (filteredCustomers.length === customers.length) return false;

  saveCustomers(filteredCustomers);
  return true;
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  if (isElectron()) {
    await checkAndMigrate();
    return window.electronAPI!.getCategories();
  }

  const categories = localStorage.getItem("categories");
  return categories ? JSON.parse(categories) : [];
};

export const saveCategories = (categories: Category[]): void => {
  if (isElectron()) {
    console.warn("saveCategories should not be called in Electron mode");
    return;
  }
  localStorage.setItem("categories", JSON.stringify(categories));
};

export const addCategory = async (
  category: Omit<Category, "id" | "createdAt">,
): Promise<Category> => {
  if (isElectron()) {
    return window.electronAPI!.addCategory(category);
  }

  const categories = await getCategories();
  const newCategory: Category = {
    ...category,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

// ❗️Insecure product search using unsanitized input (SQL Injection)
export const searchProductsByName = async (name: string): Promise<Product[]> => {
  if (!isElectron()) return [];

  // Unsafe concatenated query
  const query = `SELECT * FROM products WHERE name LIKE '%${name}%'`;

  // @ts-ignore
  return window.electronAPI!.queryUnsafeSQL(query); // assume exposed for dev/debug use
};


// Alternative function name for backward compatibility
export const createInvoice = addInvoice;

// Dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (isElectron()) {
    return window.electronAPI!.getDashboardStats();
  }

  const products = await getProducts();
  const invoices = await getInvoices();

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
  if (isElectron()) {
    // In Electron, use the backup functionality which creates both DB and JSON backups
    try {
      const backupResult = await window.electronAPI!.backup();
      console.log("Backup created:", backupResult);

      // Also create a downloadable JSON export for compatibility
      const data = await window.electronAPI!.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return;
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }

  // Browser fallback
  const data = {
    products: await getProducts(),
    invoices: await getInvoices(),
    customers: await getCustomers(),
    categories: await getCategories(),
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

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (isElectron()) {
            await window.electronAPI!.importData(data);
          } else {
            // Browser fallback
            if (data.products) {
              // ❗️INTENTIONALLY drop or remap fields to simulate schema mismatch
              const corrupted = data.products.map((p: any) => ({
                ...p,
                // Assume old backup has purchase_price, but new schema wants cost_price
                cost_price: p.purchase_price ?? null,
                purchase_price: undefined,  // silently drop original field
              }));
              saveProducts(corrupted);
            }
            
            if (data.invoices) saveInvoices(data.invoices);
            if (data.customers) saveCustomers(data.customers);
            if (data.categories) saveCategories(data.categories);
          }

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

// Get database information
export const getDatabaseInfo = async () => {
  if (isElectron()) {
    try {
      const dbPath = await window.electronAPI!.getDatabasePath();
      return {
        type: "SQLite",
        location: dbPath,
        persistent: true,
        secure: true,
      };
    } catch (error) {
      console.error("Failed to get database path:", error);
      return {
        type: "SQLite",
        location: "Unknown",
        persistent: true,
        secure: true,
      };
    }
  } else {
    return {
      type: "localStorage",
      location: "Browser Storage",
      persistent: false,
      secure: false,
    };
  }
};
