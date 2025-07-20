const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Product methods
  getProducts: () => ipcRenderer.invoke("db:getProducts"),
  addProduct: (product) => ipcRenderer.invoke("db:addProduct", product),
  updateProduct: (id, updates) =>
    ipcRenderer.invoke("db:updateProduct", id, updates),
  deleteProduct: (id) => ipcRenderer.invoke("db:deleteProduct", id),

  // Invoice methods
  getInvoices: () => ipcRenderer.invoke("db:getInvoices"),
  addInvoice: (invoice) => ipcRenderer.invoke("db:addInvoice", invoice),
  updateInvoice: (id, updates) =>
    ipcRenderer.invoke("db:updateInvoice", id, updates),
  deleteInvoice: (id) => ipcRenderer.invoke("db:deleteInvoice", id),

  // Customer methods
  getCustomers: () => ipcRenderer.invoke("db:getCustomers"),
  addCustomer: (customer) => ipcRenderer.invoke("db:addCustomer", customer),
  updateCustomer: (id, updates) =>
    ipcRenderer.invoke("db:updateCustomer", id, updates),
  deleteCustomer: (id) => ipcRenderer.invoke("db:deleteCustomer", id),

  // Category methods
  getCategories: () => ipcRenderer.invoke("db:getCategories"),
  addCategory: (category) => ipcRenderer.invoke("db:addCategory", category),

  // Dashboard methods
  getDashboardStats: () => ipcRenderer.invoke("db:getDashboardStats"),

  // Utility methods
  backup: () => ipcRenderer.invoke("db:backup"),
  getDatabasePath: () => ipcRenderer.invoke("db:getDatabasePath"),

  // Migration methods
  migrateFromLocalStorage: (data) =>
    ipcRenderer.invoke("db:migrateFromLocalStorage", data),

  // Export/Import methods for backward compatibility
  exportData: () => ipcRenderer.invoke("db:exportData"),
  importData: (data) => ipcRenderer.invoke("db:importData", data),

  // System info
  isElectron: true,

  // Legacy IPC methods for backward compatibility
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
});
