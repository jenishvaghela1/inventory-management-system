const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let db = null;

// Get the database path in user's Documents folder
function getDatabasePath() {
  const documentsPath = app.getPath("documents");
  const appDir = path.join(documentsPath, "InventoryManager");

  // Ensure directory exists
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  return path.join(appDir, "inventory.db");
}

// Initialize the database
function initializeDatabase() {
  if (db) return db;

  const dbPath = getDatabasePath();
  console.log("Database path:", dbPath);

  try {
    db = new Database(dbPath);

    // Enable WAL mode for better concurrency and crash recovery
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = 1000000");
    db.pragma("temp_store = memory");

    // Create tables if they don't exist
    createTables();

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Create all necessary tables
function createTables() {
  try {
    // Products table
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        purchase_price REAL NOT NULL,
        selling_price REAL NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
        low_stock_threshold INTEGER DEFAULT 5,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Product instances table
    db.exec(`
      CREATE TABLE IF NOT EXISTS product_instances (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        reference_number TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
        sold_at TEXT,
        invoice_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
      )
    `);

    // Customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        address TEXT,
        phone TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Invoices table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_address TEXT,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL DEFAULT 0,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Invoice items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        instance_ids TEXT, -- JSON array of instance IDs
        created_at TEXT NOT NULL,
        FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at TEXT NOT NULL
      )
    `);

    // Settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
      CREATE INDEX IF NOT EXISTS idx_product_instances_product_id ON product_instances (product_id);
      CREATE INDEX IF NOT EXISTS idx_product_instances_status ON product_instances (status);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices (created_at);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items (invoice_id);
      CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items (product_id);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Failed to create tables:", error);
    throw error;
  }
}

// Product CRUD operations
const productQueries = {
  getAll: db
    ? db.prepare("SELECT * FROM products ORDER BY created_at DESC")
    : null,
  getById: db ? db.prepare("SELECT * FROM products WHERE id = ?") : null,
  insert: db
    ? db.prepare(`
    INSERT INTO products (id, reference, name, description, category, quantity, purchase_price, selling_price, status, low_stock_threshold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    : null,
  update: db
    ? db.prepare(`
    UPDATE products 
    SET reference = ?, name = ?, description = ?, category = ?, quantity = ?, purchase_price = ?, selling_price = ?, status = ?, low_stock_threshold = ?, updated_at = ?
    WHERE id = ?
  `)
    : null,
  delete: db ? db.prepare("DELETE FROM products WHERE id = ?") : null,
};

// Product Instance CRUD operations
const instanceQueries = {
  getByProductId: db
    ? db.prepare(
        "SELECT * FROM product_instances WHERE product_id = ? ORDER BY created_at DESC",
      )
    : null,
  insert: db
    ? db.prepare(`
    INSERT INTO product_instances (id, product_id, reference_number, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)
    : null,
  updateStatus: db
    ? db.prepare(`
    UPDATE product_instances 
    SET status = ?, sold_at = ?, invoice_id = ?
    WHERE id = ?
  `)
    : null,
  delete: db ? db.prepare("DELETE FROM product_instances WHERE id = ?") : null,
};

// Customer CRUD operations
const customerQueries = {
  getAll: db
    ? db.prepare("SELECT * FROM customers ORDER BY created_at DESC")
    : null,
  insert: db
    ? db.prepare(`
    INSERT INTO customers (id, name, email, address, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
    : null,
  update: db
    ? db.prepare(`
    UPDATE customers 
    SET name = ?, email = ?, address = ?, phone = ?
    WHERE id = ?
  `)
    : null,
  delete: db ? db.prepare("DELETE FROM customers WHERE id = ?") : null,
};

// Invoice CRUD operations
const invoiceQueries = {
  getAll: db
    ? db.prepare("SELECT * FROM invoices ORDER BY created_at DESC")
    : null,
  getById: db ? db.prepare("SELECT * FROM invoices WHERE id = ?") : null,
  insert: db
    ? db.prepare(`
    INSERT INTO invoices (id, customer_name, customer_email, customer_address, subtotal, tax, total, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    : null,
  update: db
    ? db.prepare(`
    UPDATE invoices 
    SET customer_name = ?, customer_email = ?, customer_address = ?, subtotal = ?, tax = ?, total = ?, status = ?, updated_at = ?
    WHERE id = ?
  `)
    : null,
  delete: db ? db.prepare("DELETE FROM invoices WHERE id = ?") : null,
};

// Invoice Items CRUD operations
const invoiceItemQueries = {
  getByInvoiceId: db
    ? db.prepare("SELECT * FROM invoice_items WHERE invoice_id = ?")
    : null,
  insert: db
    ? db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, price, total, instance_ids, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    : null,
  deleteByInvoiceId: db
    ? db.prepare("DELETE FROM invoice_items WHERE invoice_id = ?")
    : null,
};

// Category CRUD operations
const categoryQueries = {
  getAll: db ? db.prepare("SELECT * FROM categories ORDER BY name") : null,
  insert: db
    ? db.prepare(`
    INSERT INTO categories (id, name, description, created_at)
    VALUES (?, ?, ?, ?)
  `)
    : null,
  update: db
    ? db.prepare(`
    UPDATE categories 
    SET name = ?, description = ?
    WHERE id = ?
  `)
    : null,
  delete: db ? db.prepare("DELETE FROM categories WHERE id = ?") : null,
};

// Database operations
const dbOperations = {
  // Initialize
  initialize: initializeDatabase,

  // Products
  getProducts: () => {
    if (!db) initializeDatabase();
    const products = productQueries.getAll.all();

    // Get instances for each product
    return products.map((product) => {
      const instances = instanceQueries.getByProductId.all(product.id);
      return {
        ...product,
        instances: instances || [],
      };
    });
  },

  addProduct: (product) => {
    if (!db) initializeDatabase();

    const transaction = db.transaction(() => {
      const id = Date.now().toString();
      const now = new Date().toISOString();

      // Insert main product
      productQueries.insert.run(
        id,
        product.reference,
        product.name,
        product.description || null,
        product.category,
        product.quantity || 0,
        product.purchase_price,
        product.selling_price,
        product.status || "active",
        product.lowStockThreshold || 5,
        now,
        now,
      );

      // Insert instances if provided
      if (product.instances && product.instances.length > 0) {
        product.instances.forEach((instance) => {
          instanceQueries.insert.run(
            instance.id ||
              Date.now().toString() + Math.random().toString(36).substr(2, 9),
            id,
            instance.referenceNumber,
            instance.status || "available",
            now,
          );
        });
      }

      return { ...product, id, createdAt: now, updatedAt: now };
    });

    return transaction();
  },

  updateProduct: (id, updates) => {
    if (!db) initializeDatabase();
    const now = new Date().toISOString();

    const result = productQueries.update.run(
      updates.reference,
      updates.name,
      updates.description || null,
      updates.category,
      updates.quantity || 0,
      updates.purchase_price,
      updates.selling_price,
      updates.status || "active",
      updates.lowStockThreshold || 5,
      now,
      id,
    );

    if (result.changes === 0) return null;

    const updated = productQueries.getById.get(id);
    const instances = instanceQueries.getByProductId.all(id);
    return { ...updated, instances };
  },

  deleteProduct: (id) => {
    if (!db) initializeDatabase();
    const result = productQueries.delete.run(id);
    return result.changes > 0;
  },

  // Invoices
  getInvoices: () => {
    if (!db) initializeDatabase();
    const invoices = invoiceQueries.getAll.all();

    // Get items for each invoice
    return invoices.map((invoice) => {
      const items = invoiceItemQueries.getByInvoiceId.all(invoice.id);
      return {
        ...invoice,
        items: items.map((item) => ({
          ...item,
          instanceIds: item.instance_ids ? JSON.parse(item.instance_ids) : [],
        })),
      };
    });
  },

  addInvoice: (invoice) => {
    if (!db) initializeDatabase();

    const transaction = db.transaction(() => {
      const id = Date.now().toString();
      const now = new Date().toISOString();

      // Insert main invoice
      invoiceQueries.insert.run(
        id,
        invoice.customerName,
        invoice.customerEmail || null,
        invoice.customerAddress || null,
        invoice.subtotal,
        invoice.tax || 0,
        invoice.total,
        invoice.status || "pending",
        now,
        now,
      );

      // Insert invoice items
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          const itemId =
            Date.now().toString() + Math.random().toString(36).substr(2, 9);
          invoiceItemQueries.insert.run(
            itemId,
            id,
            item.productId,
            item.productName,
            item.quantity,
            item.price,
            item.total,
            item.instanceIds ? JSON.stringify(item.instanceIds) : null,
            now,
          );
        });
      }

      return { ...invoice, id, createdAt: now, updatedAt: now };
    });

    return transaction();
  },

  updateInvoice: (id, updates) => {
    if (!db) initializeDatabase();
    const now = new Date().toISOString();

    const result = invoiceQueries.update.run(
      updates.customerName,
      updates.customerEmail || null,
      updates.customerAddress || null,
      updates.subtotal,
      updates.tax || 0,
      updates.total,
      updates.status || "pending",
      now,
      id,
    );

    if (result.changes === 0) return null;

    const updated = invoiceQueries.getById.get(id);
    const items = invoiceItemQueries.getByInvoiceId.all(id);
    return {
      ...updated,
      items: items.map((item) => ({
        ...item,
        instanceIds: item.instance_ids ? JSON.parse(item.instance_ids) : [],
      })),
    };
  },

  deleteInvoice: (id) => {
    if (!db) initializeDatabase();
    const result = invoiceQueries.delete.run(id);
    return result.changes > 0;
  },

  // Customers
  getCustomers: () => {
    if (!db) initializeDatabase();
    return customerQueries.getAll.all();
  },

  addCustomer: (customer) => {
    if (!db) initializeDatabase();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    customerQueries.insert.run(
      id,
      customer.name,
      customer.email || null,
      customer.address || null,
      customer.phone || null,
      now,
    );

    return { ...customer, id, createdAt: now };
  },

  updateCustomer: (id, updates) => {
    if (!db) initializeDatabase();

    const result = customerQueries.update.run(
      updates.name,
      updates.email || null,
      updates.address || null,
      updates.phone || null,
      id,
    );

    if (result.changes === 0) return null;

    // Return the updated customer
    const updated = customerQueries.getAll.all().find((c) => c.id === id);
    return updated || null;
  },

  deleteCustomer: (id) => {
    if (!db) initializeDatabase();
    const result = customerQueries.delete.run(id);
    return result.changes > 0;
  },

  // Categories
  getCategories: () => {
    if (!db) initializeDatabase();
    return categoryQueries.getAll.all();
  },

  addCategory: (category) => {
    if (!db) initializeDatabase();
    const id = Date.now().toString();
    const now = new Date().toISOString();

    categoryQueries.insert.run(
      id,
      category.name,
      category.description || null,
      now,
    );

    return { ...category, id, createdAt: now };
  },

  // Dashboard stats
  getDashboardStats: () => {
    if (!db) initializeDatabase();

    const productCount = db
      .prepare("SELECT COUNT(*) as count FROM products")
      .get().count;
    const totalStock =
      db.prepare("SELECT SUM(quantity) as total FROM products").get().total ||
      0;
    const totalRevenue =
      db
        .prepare("SELECT SUM(total) as total FROM invoices WHERE status = ?")
        .get("paid").total || 0;
    const totalInvoices = db
      .prepare("SELECT COUNT(*) as count FROM invoices")
      .get().count;
    const lowStockProducts = db
      .prepare(
        "SELECT COUNT(*) as count FROM products WHERE quantity <= low_stock_threshold",
      )
      .get().count;

    // Recent sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSales =
      db
        .prepare(
          "SELECT SUM(total) as total FROM invoices WHERE status = ? AND created_at >= ?",
        )
        .get("paid", thirtyDaysAgo.toISOString()).total || 0;

    return {
      productCount,
      totalStock,
      totalRevenue,
      totalInvoices,
      lowStockProducts,
      recentSales,
    };
  },

  // Backup operations
  backup: async () => {
    if (!db) initializeDatabase();

    const documentsPath = app.getPath("documents");
    const backupDir = path.join(documentsPath, "InventoryManager", "backups");

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `inventory-backup-${timestamp}.db`);

    try {
      // Create backup by copying database file
      db.backup(backupPath);

      // Also create JSON backup for compatibility
      const jsonBackup = {
        products: dbOperations.getProducts(),
        invoices: dbOperations.getInvoices(),
        customers: dbOperations.getCustomers(),
        categories: dbOperations.getCategories(),
        exportDate: new Date().toISOString(),
      };

      const jsonBackupPath = path.join(
        backupDir,
        `inventory-backup-${timestamp}.json`,
      );
      fs.writeFileSync(jsonBackupPath, JSON.stringify(jsonBackup, null, 2));

      return { dbBackup: backupPath, jsonBackup: jsonBackupPath };
    } catch (error) {
      console.error("Backup failed:", error);
      throw error;
    }
  },

  // Utility
  getDatabasePath: getDatabasePath,

  // Migration from localStorage
  migrateFromLocalStorage: (localStorageData) => {
    if (!db) initializeDatabase();

    const transaction = db.transaction(() => {
      // Migrate products
      if (localStorageData.products) {
        localStorageData.products.forEach((product) => {
          try {
            dbOperations.addProduct(product);
          } catch (error) {
            console.warn(
              "Failed to migrate product:",
              product.id,
              error.message,
            );
          }
        });
      }

      // Migrate invoices
      if (localStorageData.invoices) {
        localStorageData.invoices.forEach((invoice) => {
          try {
            dbOperations.addInvoice(invoice);
          } catch (error) {
            console.warn(
              "Failed to migrate invoice:",
              invoice.id,
              error.message,
            );
          }
        });
      }

      // Migrate customers
      if (localStorageData.customers) {
        localStorageData.customers.forEach((customer) => {
          try {
            dbOperations.addCustomer(customer);
          } catch (error) {
            console.warn(
              "Failed to migrate customer:",
              customer.id,
              error.message,
            );
          }
        });
      }

      // Migrate categories
      if (localStorageData.categories) {
        localStorageData.categories.forEach((category) => {
          try {
            dbOperations.addCategory(category);
          } catch (error) {
            console.warn(
              "Failed to migrate category:",
              category.id,
              error.message,
            );
          }
        });
      }
    });

    transaction();
    console.log("Migration from localStorage completed");
  },

  // Close database connection
  close: () => {
    if (db) {
      db.close();
      db = null;
    }
  },
};

// Initialize prepared statements after database is created
function initializeQueries() {
  if (!db) return;

  productQueries.getAll = db.prepare(
    "SELECT * FROM products ORDER BY created_at DESC",
  );
  productQueries.getById = db.prepare("SELECT * FROM products WHERE id = ?");
  productQueries.insert = db.prepare(`
    INSERT INTO products (id, reference, name, description, category, quantity, purchase_price, selling_price, status, low_stock_threshold, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  productQueries.update = db.prepare(`
    UPDATE products 
    SET reference = ?, name = ?, description = ?, category = ?, quantity = ?, purchase_price = ?, selling_price = ?, status = ?, low_stock_threshold = ?, updated_at = ?
    WHERE id = ?
  `);
  productQueries.delete = db.prepare("DELETE FROM products WHERE id = ?");

  instanceQueries.getByProductId = db.prepare(
    "SELECT * FROM product_instances WHERE product_id = ? ORDER BY created_at DESC",
  );
  instanceQueries.insert = db.prepare(`
    INSERT INTO product_instances (id, product_id, reference_number, status, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  instanceQueries.updateStatus = db.prepare(`
    UPDATE product_instances 
    SET status = ?, sold_at = ?, invoice_id = ?
    WHERE id = ?
  `);
  instanceQueries.delete = db.prepare(
    "DELETE FROM product_instances WHERE id = ?",
  );

  customerQueries.getAll = db.prepare(
    "SELECT * FROM customers ORDER BY created_at DESC",
  );
  customerQueries.insert = db.prepare(`
    INSERT INTO customers (id, name, email, address, phone, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  customerQueries.update = db.prepare(`
    UPDATE customers 
    SET name = ?, email = ?, address = ?, phone = ?
    WHERE id = ?
  `);
  customerQueries.delete = db.prepare("DELETE FROM customers WHERE id = ?");

  invoiceQueries.getAll = db.prepare(
    "SELECT * FROM invoices ORDER BY created_at DESC",
  );
  invoiceQueries.getById = db.prepare("SELECT * FROM invoices WHERE id = ?");
  invoiceQueries.insert = db.prepare(`
    INSERT INTO invoices (id, customer_name, customer_email, customer_address, subtotal, tax, total, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  invoiceQueries.update = db.prepare(`
    UPDATE invoices 
    SET customer_name = ?, customer_email = ?, customer_address = ?, subtotal = ?, tax = ?, total = ?, status = ?, updated_at = ?
    WHERE id = ?
  `);
  invoiceQueries.delete = db.prepare("DELETE FROM invoices WHERE id = ?");

  invoiceItemQueries.getByInvoiceId = db.prepare(
    "SELECT * FROM invoice_items WHERE invoice_id = ?",
  );
  invoiceItemQueries.insert = db.prepare(`
    INSERT INTO invoice_items (id, invoice_id, product_id, product_name, quantity, price, total, instance_ids, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  invoiceItemQueries.deleteByInvoiceId = db.prepare(
    "DELETE FROM invoice_items WHERE invoice_id = ?",
  );

  categoryQueries.getAll = db.prepare("SELECT * FROM categories ORDER BY name");
  categoryQueries.insert = db.prepare(`
    INSERT INTO categories (id, name, description, created_at)
    VALUES (?, ?, ?, ?)
  `);
  categoryQueries.update = db.prepare(`
    UPDATE categories 
    SET name = ?, description = ?
    WHERE id = ?
  `);
  categoryQueries.delete = db.prepare("DELETE FROM categories WHERE id = ?");
}

// Override query initialization after database creation
const originalInitialize = dbOperations.initialize;
dbOperations.initialize = () => {
  const result = originalInitialize();
  initializeQueries();
  return result;
};

module.exports = dbOperations;
