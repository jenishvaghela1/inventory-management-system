"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import Products from "@/components/products";
import Invoices from "@/components/invoices";
import CreateInvoice from "@/components/create-invoice";
import Settings from "@/components/settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState("light");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "invoices":
        return <Invoices />;
      case "create-invoice":
        return <CreateInvoice />;
      case "settings":
        return (
          <Settings
            onThemeChange={(newTheme) => setTheme(newTheme)}
            currentTheme={theme}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider defaultTheme={theme} storageKey="inventory-theme">
      <div className="flex h-screen bg-background">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </ThemeProvider>
  );
}
