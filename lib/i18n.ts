export type Language = "en" | "fr";

export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    products: "Products",
    invoices: "Invoices",
    settings: "Settings",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome":
      "Welcome back! Here's what's happening with your inventory.",
    "dashboard.totalProducts": "Total Products",
    "dashboard.totalStock": "Total Stock Items",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.lowStockAlert": "Low Stock Alert",
    "dashboard.lowStockDescription": "Products with low stock",
    "dashboard.recentSales": "Recent Sales (30 days)",
    "dashboard.salesPerformance": "Sales Performance",
    "dashboard.productStock": "Product Stock Levels",
    "dashboard.recentInvoices": "Recent Invoices",
    "dashboard.analytics": "Analytics",
    "dashboard.showAnalytics": "Advanced Analytics",
    "dashboard.hideAnalytics": "Basic View",

    // Products
    "products.title": "Products",
    "products.subtitle": "Manage your inventory and product catalog",
    "products.addProduct": "Add Product",
    "products.reference": "Reference",
    "products.name": "Product Name",
    "products.namePlaceholder": "Product name",
    "products.category": "Category",
    "products.quantity": "Quantity",
    "products.purchasePrice": "Purchase Price",
    "products.sellingPrice": "Selling Price",
    "products.profit": "Profit",
    "products.stock": "Stock",
    "products.lowStock": "Low Stock",
    "products.outOfStock": "Out of Stock",
    "products.inStock": "In Stock",
    "products.actions": "Actions",
    "products.created": "Created",
    "products.updated": "Updated",
    "products.editProduct": "Edit Product",
    "products.editDescription": "Make changes to the product details",
    "products.deleteProduct": "Delete Product",
    "products.confirmDelete": "Are you sure you want to delete this product?",
    "products.searchPlaceholder": "Search products...",
    "products.noProducts": "No products available",
    "products.creating": "Creating...",
    "products.createProduct": "Create Product",

    // Invoices
    "invoices.title": "Invoices",
    "invoices.subtitle": "Manage your sales invoices and billing",
    "invoices.createInvoice": "Create New Invoice",
    "invoices.invoiceId": "Invoice ID",
    "invoices.clientName": "Client Name",
    "invoices.email": "Email",
    "invoices.date": "Date",
    "invoices.itemsCount": "Items Count",
    "invoices.items": "items",
    "invoices.total": "Total",
    "invoices.customer": "Customer",
    "invoices.status": "Status",
    "invoices.actions": "Actions",
    "invoices.paid": "Paid",
    "invoices.pending": "Pending",
    "invoices.overdue": "Overdue",
    "invoices.view": "View",
    "invoices.edit": "Edit",
    "invoices.delete": "Delete",
    "invoices.downloadPdf": "PDF",
    "invoices.customerName": "Customer Name",
    "invoices.customerEmail": "Customer Email",
    "invoices.customerAddress": "Customer Address",
    "invoices.subtotal": "Subtotal",
    "invoices.tax": "Tax",
    "invoices.searchPlaceholder": "Search by client name...",
    "invoices.noInvoices": "No invoices created yet",
    "invoices.noResults": "No invoices match your search criteria",
    "invoices.generatingPdf": "Generating PDF...",

    // Auth
    "auth.login": "Login",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.loginButton": "Sign In",
    "auth.logout": "Logout",

    // Sidebar
    "sidebar.collapse": "Collapse",
    "sidebar.expand": "Expand",

    // Settings
    "settings.title": "Settings",
    "settings.description":
      "Configure your application preferences and account settings",

    // Settings Tabs
    "settings.tabs.accounts": "Accounts",
    "settings.tabs.profile": "Profile",
    "settings.tabs.security": "Security",
    "settings.tabs.appearance": "Appearance",
    "settings.tabs.language": "Language",
    "settings.tabs.currency": "Currency",
    "settings.tabs.company": "Company",
    "settings.tabs.database": "Database",

    // Settings Accounts
    "settings.accounts.title": "User Accounts",
    "settings.accounts.description": "Manage user accounts and permissions",
    "settings.accounts.addAccount": "Add Account",
    "settings.accounts.noAccounts": "No user accounts found.",
    "settings.accounts.createFirst": "Create First Account",
    "settings.accounts.name": "Name",
    "settings.accounts.email": "Email",
    "settings.accounts.role": "Role",
    "settings.accounts.created": "Created",
    "settings.accounts.actions": "Actions",
    "settings.accounts.editAccount": "Edit Account",
    "settings.accounts.createAccount": "Create Account",
    "settings.accounts.user": "User",
    "settings.accounts.admin": "Admin",
    "settings.accounts.password": "Password",
    "settings.accounts.confirmPassword": "Confirm Password",
    "settings.accounts.deleteConfirm":
      "Are you sure you want to delete this account?",

    // Settings Profile
    "settings.profile.title": "Profile Settings",
    "settings.profile.description": "Update your personal information",
    "settings.profile.fullName": "Full Name",
    "settings.profile.updateProfile": "Update Profile",

    // Settings Security
    "settings.security.title": "Security Settings",
    "settings.security.description":
      "Manage your password and security preferences",
    "settings.security.currentPassword": "Current Password",
    "settings.security.newPassword": "New Password",
    "settings.security.confirmNewPassword": "Confirm New Password",
    "settings.security.changePassword": "Change Password",

    // Settings Appearance
    "settings.appearance.title": "Appearance",
    "settings.appearance.description":
      "Customize the look and feel of your application",
    "settings.appearance.darkMode": "Dark Mode",
    "settings.appearance.darkModeDesc": "Toggle between light and dark themes",

    // Settings Language
    "settings.language.title": "Language Settings",
    "settings.language.description": "Choose your preferred language",
    "settings.language.select": "Select Language",
    "settings.language.english": "🇺🇸 English",
    "settings.language.french": "🇫🇷 French",

    // Settings Currency
    "settings.currency.title": "Currency Settings",
    "settings.currency.description":
      "Set your preferred currency for financial data",
    "settings.currency.current": "Current Currency",
    "settings.currency.select": "Select Currency",

    // Settings Company
    "settings.company.title": "Company Information",
    "settings.company.description": "Update your company details",
    "settings.company.name": "Company Name",
    "settings.company.phone": "Phone Number",
    "settings.company.address": "Address",
    "settings.company.save": "Save Company Info",

    // Settings Database
    "settings.database.title": "Database Management",
    "settings.database.description": "Export and import your data",
    "settings.database.export": "Export Data",
    "settings.database.import": "Import Data",
    "settings.database.important": "Important Notes:",
    "settings.database.exportDesc": "Export creates a backup of all your data",
    "settings.database.importDesc": "Import will replace all existing data",
    "settings.database.backupDesc": "Always backup before importing new data",

    // Common
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.create": "Create",
    "common.update": "Update",
    "common.logout": "Logout",
    "common.search": "Search...",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.loading": "Loading...",
    "common.view": "View",
    "common.confirmDelete": "Confirm Delete",
    "common.deleteWarning": "Are you sure you want to delete",
    "common.undoWarning": "This action cannot be undone.",
    "common.noResults": "No results found",
    "common.notAvailable": "N/A",

    // Messages
    "messages.profileUpdated": "Profile Updated",
    "messages.passwordChanged": "Password Changed",
    "messages.languageChanged": "Language Changed",
    "messages.currencyUpdated": "Currency Updated",
    "messages.settingsSaved": "Settings Saved",
    "messages.accountUpdated": "Account Updated",
    "messages.accountCreated": "Account Created",
    "messages.accountDeleted": "Account Deleted",
  },
  fr: {
    // Navigation
    dashboard: "Tableau de bord",
    products: "Produits",
    invoices: "Factures",
    settings: "Paramètres",

    // Dashboard
    "dashboard.title": "Tableau de bord",
    "dashboard.welcome":
      "Bon retour! Voici ce qui se passe avec votre inventaire.",
    "dashboard.totalProducts": "Total des produits",
    "dashboard.totalStock": "Articles en stock total",
    "dashboard.totalRevenue": "Chiffre d'affaires total",
    "dashboard.lowStockAlert": "Alerte stock faible",
    "dashboard.lowStockDescription": "Produits avec stock faible",
    "dashboard.recentSales": "Ventes récentes (30 jours)",
    "dashboard.salesPerformance": "Performance des ventes",
    "dashboard.productStock": "Niveaux de stock des produits",
    "dashboard.recentInvoices": "Factures récentes",
    "dashboard.analytics": "Analyses",
    "dashboard.showAnalytics": "Analyses avancées",
    "dashboard.hideAnalytics": "Vue de base",

    // Products
    "products.title": "Produits",
    "products.subtitle": "Gérez votre inventaire et catalogue de produits",
    "products.addProduct": "Ajouter un produit",
    "products.reference": "Référence",
    "products.name": "Nom du produit",
    "products.namePlaceholder": "Nom du produit",
    "products.category": "Catégorie",
    "products.quantity": "Quantité",
    "products.purchasePrice": "Prix d'achat",
    "products.sellingPrice": "Prix de vente",
    "products.profit": "Profit",
    "products.stock": "Stock",
    "products.lowStock": "Stock faible",
    "products.outOfStock": "Rupture de stock",
    "products.inStock": "En stock",
    "products.actions": "Actions",
    "products.created": "Créé",
    "products.updated": "Mis à jour",
    "products.editProduct": "Modifier le produit",
    "products.editDescription":
      "Apportez des modifications aux détails du produit",
    "products.deleteProduct": "Supprimer le produit",
    "products.confirmDelete": "Êtes-vous sûr de vouloir supprimer ce produit ?",
    "products.searchPlaceholder": "Rechercher des produits...",
    "products.noProducts": "Aucun produit disponible",
    "products.creating": "Création...",
    "products.createProduct": "Créer un produit",

    // Invoices
    "invoices.title": "Factures",
    "invoices.subtitle": "Gérez vos factures de vente et facturation",
    "invoices.createInvoice": "Créer une nouvelle facture",
    "invoices.invoiceId": "ID Facture",
    "invoices.clientName": "Nom du client",
    "invoices.email": "Email",
    "invoices.date": "Date",
    "invoices.itemsCount": "Nombre d'articles",
    "invoices.items": "articles",
    "invoices.total": "Total",
    "invoices.customer": "Client",
    "invoices.status": "Statut",
    "invoices.actions": "Actions",
    "invoices.paid": "Payé",
    "invoices.pending": "En attente",
    "invoices.overdue": "En retard",
    "invoices.view": "Voir",
    "invoices.edit": "Modifier",
    "invoices.delete": "Supprimer",
    "invoices.downloadPdf": "PDF",
    "invoices.customerName": "Nom du client",
    "invoices.customerEmail": "Email du client",
    "invoices.customerAddress": "Adresse du client",
    "invoices.subtotal": "Sous-total",
    "invoices.tax": "Taxe",
    "invoices.searchPlaceholder": "Rechercher par nom de client...",
    "invoices.noInvoices": "Aucune facture créée encore",
    "invoices.noResults":
      "Aucune facture ne correspond à vos critères de recherche",
    "invoices.generatingPdf": "Génération du PDF...",

    // Auth
    "auth.login": "Connexion",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.loginButton": "Se connecter",
    "auth.logout": "Déconnexion",

    // Sidebar
    "sidebar.collapse": "Réduire",
    "sidebar.expand": "Étendre",

    // Settings
    "settings.title": "Paramètres",
    "settings.description":
      "Configurez vos préférences d'application et paramètres de compte",

    // Settings Tabs
    "settings.tabs.accounts": "Comptes",
    "settings.tabs.profile": "Profil",
    "settings.tabs.security": "Sécurité",
    "settings.tabs.appearance": "Apparence",
    "settings.tabs.language": "Langue",
    "settings.tabs.currency": "Devise",
    "settings.tabs.company": "Entreprise",
    "settings.tabs.database": "Base de données",

    // Settings Accounts
    "settings.accounts.title": "Comptes utilisateurs",
    "settings.accounts.description":
      "Gérer les comptes utilisateurs et les permissions",
    "settings.accounts.addAccount": "Ajouter un compte",
    "settings.accounts.noAccounts": "Aucun compte utilisateur trouvé.",
    "settings.accounts.createFirst": "Créer le premier compte",
    "settings.accounts.name": "Nom",
    "settings.accounts.email": "Email",
    "settings.accounts.role": "Rôle",
    "settings.accounts.created": "Créé",
    "settings.accounts.actions": "Actions",
    "settings.accounts.editAccount": "Modifier le compte",
    "settings.accounts.createAccount": "Créer un compte",
    "settings.accounts.user": "Utilisateur",
    "settings.accounts.admin": "Administrateur",
    "settings.accounts.password": "Mot de passe",
    "settings.accounts.confirmPassword": "Confirmer le mot de passe",
    "settings.accounts.deleteConfirm":
      "Êtes-vous sûr de vouloir supprimer ce compte?",

    // Settings Profile
    "settings.profile.title": "Paramètres du profil",
    "settings.profile.description":
      "Mettre à jour vos informations personnelles",
    "settings.profile.fullName": "Nom complet",
    "settings.profile.updateProfile": "Mettre à jour le profil",

    // Settings Security
    "settings.security.title": "Paramètres de sécurité",
    "settings.security.description":
      "Gérer votre mot de passe et préférences de sécurité",
    "settings.security.currentPassword": "Mot de passe actuel",
    "settings.security.newPassword": "Nouveau mot de passe",
    "settings.security.confirmNewPassword": "Confirmer le nouveau mot de passe",
    "settings.security.changePassword": "Changer le mot de passe",

    // Settings Appearance
    "settings.appearance.title": "Apparence",
    "settings.appearance.description":
      "Personnaliser l'apparence de votre application",
    "settings.appearance.darkMode": "Mode sombre",
    "settings.appearance.darkModeDesc":
      "Basculer entre les thèmes clair et sombre",

    // Settings Language
    "settings.language.title": "Paramètres de langue",
    "settings.language.description": "Choisissez votre langue préférée",
    "settings.language.select": "Sélectionner la langue",
    "settings.language.english": "🇺🇸 Anglais",
    "settings.language.french": "🇫🇷 Français",

    // Settings Currency
    "settings.currency.title": "Paramètres de devise",
    "settings.currency.description":
      "Définir votre devise préférée pour les données financières",
    "settings.currency.current": "Devise actuelle",
    "settings.currency.select": "Sélectionner la devise",

    // Settings Company
    "settings.company.title": "Informations sur l'entreprise",
    "settings.company.description":
      "Mettre à jour les détails de votre entreprise",
    "settings.company.name": "Nom de l'entreprise",
    "settings.company.phone": "Numéro de téléphone",
    "settings.company.address": "Adresse",
    "settings.company.save": "Enregistrer les infos de l'entreprise",

    // Settings Database
    "settings.database.title": "Gestion de la base de données",
    "settings.database.description": "Exporter et importer vos données",
    "settings.database.export": "Exporter les données",
    "settings.database.import": "Importer les données",
    "settings.database.important": "Notes importantes:",
    "settings.database.exportDesc":
      "L'exportation crée une sauvegarde de toutes vos données",
    "settings.database.importDesc":
      "L'importation remplacera toutes les données existantes",
    "settings.database.backupDesc":
      "Toujours sauvegarder avant d'importer de nouvelles données",

    // Common
    "common.cancel": "Annuler",
    "common.save": "Enregistrer",
    "common.edit": "Modifier",
    "common.delete": "Supprimer",
    "common.create": "Créer",
    "common.update": "Mettre à jour",
    "common.logout": "Déconnexion",
    "common.search": "Rechercher...",
    "common.actions": "Actions",
    "common.status": "Statut",
    "common.loading": "Chargement...",
    "common.view": "Voir",
    "common.confirmDelete": "Confirmer la suppression",
    "common.deleteWarning": "Êtes-vous sûr de vouloir supprimer",
    "common.undoWarning": "Cette action ne peut pas être annulée.",
    "common.noResults": "Aucun résultat trouvé",
    "common.notAvailable": "N/D",

    // Messages
    "messages.profileUpdated": "Profil mis à jour",
    "messages.passwordChanged": "Mot de passe modifié",
    "messages.languageChanged": "Langue modifiée",
    "messages.currencyUpdated": "Devise mise à jour",
    "messages.settingsSaved": "Paramètres sauvegardés",
    "messages.accountUpdated": "Compte mis à jour",
    "messages.accountCreated": "Compte créé",
    "messages.accountDeleted": "Compte supprimé",
  },
};

export function getTranslation(language: Language, key: string): string {
  const keys = key.split(".");
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
  }

  return value || translations.en[key as keyof typeof translations.en] || key;
}
