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

  // Dashboard methods
  getDashboardStats: () => ipcRenderer.invoke("db:getDashboardStats"),

  // Utility methods
  backup: () => ipcRenderer.invoke("db:backup"),
  getDatabasePath: () => ipcRenderer.invoke("db:getDatabasePath"),

  // System info
  isElectron: true,
  platform: process.platform,
});

// Expose environment information
contextBridge.exposeInMainWorld("processEnv", {
  NODE_ENV: process.env.NODE_ENV,
});
