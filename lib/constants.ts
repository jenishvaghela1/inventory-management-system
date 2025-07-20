export const CURRENCIES = {
  DZD: {
    CODE: "DZD",
    SYMBOL: "دج",
    NAME: "Algerian Dinar",
  },
  USD: {
    CODE: "USD",
    SYMBOL: "$",
    NAME: "US Dollar",
  },
  EUR: {
    CODE: "EUR",
    SYMBOL: "€",
    NAME: "Euro",
  },
} as const;

export const CURRENCY = {
  DZD: {
    CODE: "DZD",
    SYMBOL: "دج",
    NAME: "Algerian Dinar",
  },
  USD: {
    CODE: "USD",
    SYMBOL: "$",
    NAME: "US Dollar",
  },
  EUR: {
    CODE: "EUR",
    SYMBOL: "€",
    NAME: "Euro",
  },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_CURRENCY: CurrencyCode = "DZD";

export const STOCK_THRESHOLDS = {
  LOW_STOCK: 5,
  OUT_OF_STOCK: 0,
};

export const TAX_RATES = {
  DEFAULT_VAT: 19, // Algeria VAT rate
};

export const COMPANY_DEFAULTS = {
  name: "Inventory Manager",
  address: "123 Business Street, Algiers, Algeria",
  phone: "+213 123 456 789",
  email: "info@inventorymanager.dz",
};

export const MODAL_TYPES = {
  CREATE_PRODUCT: "CREATE_PRODUCT",
  CREATE_INVOICE: "CREATE_INVOICE",
  LOW_STOCK: "LOW_STOCK",
  QR_CODE: "QR_CODE",
  EDIT_INSTANCE: "EDIT_INSTANCE",
} as const;
