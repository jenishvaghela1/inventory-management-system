const { app, BrowserWindow, ipcMain } = require("electron");
const serve = require("electron-serve");
const path = require("path");

// Import our database operations
const db = require("./lib/electron-database");

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../out"),
    })
  : null;

const createWindow = () => {
  const win = new BrowserWindow({
    height: 800,
    width: 600,
    icon: path.join(
      __dirname,
      "/public/inventory-manager-high-resolution-logo.png",
    ),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.maximize();
  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }
};

// Initialize database when app is ready
app.on("ready", () => {
  // Initialize database
  try {
    db.initialize();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  createWindow();
});

app.on("window-all-closed", () => {
  // Close database connection before quitting
  db.close();

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Ensure database is closed before app quits
  db.close();
});

// IPC Handlers for database operations

// Product handlers
ipcMain.handle("db:getProducts", async () => {
  try {
    return await db.getProducts();
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
});

ipcMain.handle("db:addProduct", async (event, product) => {
  try {
    return await db.addProduct(product);
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
});

ipcMain.handle("db:updateProduct", async (event, id, updates) => {
  try {
    return await db.updateProduct(id, updates);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
});

ipcMain.handle("db:deleteProduct", async (event, id) => {
  try {
    return await db.deleteProduct(id);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
});

// Invoice handlers
ipcMain.handle("db:getInvoices", async () => {
  try {
    return await db.getInvoices();
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
});

ipcMain.handle("db:addInvoice", async (event, invoice) => {
  try {
    return await db.addInvoice(invoice);
  } catch (error) {
    console.error("Error adding invoice:", error);
    throw error;
  }
});

ipcMain.handle("db:updateInvoice", async (event, id, updates) => {
  try {
    return await db.updateInvoice(id, updates);
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
});

ipcMain.handle("db:deleteInvoice", async (event, id) => {
  try {
    return await db.deleteInvoice(id);
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
});

// Customer handlers
ipcMain.handle("db:getCustomers", async () => {
  try {
    return await db.getCustomers();
  } catch (error) {
    console.error("Error getting customers:", error);
    throw error;
  }
});

ipcMain.handle("db:addCustomer", async (event, customer) => {
  try {
    return await db.addCustomer(customer);
  } catch (error) {
    console.error("Error adding customer:", error);
    throw error;
  }
});

ipcMain.handle("db:updateCustomer", async (event, id, updates) => {
  try {
    return await db.updateCustomer(id, updates);
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
});

ipcMain.handle("db:deleteCustomer", async (event, id) => {
  try {
    return await db.deleteCustomer(id);
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
});

// Category handlers
ipcMain.handle("db:getCategories", async () => {
  try {
    return await db.getCategories();
  } catch (error) {
    console.error("Error getting categories:", error);
    throw error;
  }
});

ipcMain.handle("db:addCategory", async (event, category) => {
  try {
    return await db.addCategory(category);
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
});

// Dashboard handlers
ipcMain.handle("db:getDashboardStats", async () => {
  try {
    return await db.getDashboardStats();
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
});

// Utility handlers
ipcMain.handle("db:backup", async () => {
  try {
    return await db.backup();
  } catch (error) {
    console.error("Error creating backup:", error);
    throw error;
  }
});

ipcMain.handle("db:getDatabasePath", async () => {
  try {
    return db.getDatabasePath();
  } catch (error) {
    console.error("Error getting database path:", error);
    throw error;
  }
});

// Migration handler
ipcMain.handle(
  "db:migrateFromLocalStorage",
  async (event, localStorageData) => {
    try {
      return await db.migrateFromLocalStorage(localStorageData);
    } catch (error) {
      console.error("Error migrating from localStorage:", error);
      throw error;
    }
  },
);

// Export/Import handlers for backward compatibility
ipcMain.handle("db:exportData", async () => {
  try {
    const data = {
      products: await db.getProducts(),
      invoices: await db.getInvoices(),
      customers: await db.getCustomers(),
      categories: await db.getCategories(),
      exportDate: new Date().toISOString(),
    };
    return data;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
});

ipcMain.handle("db:importData", async (event, data) => {
  try {
    return await db.migrateFromLocalStorage(data);
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
});
