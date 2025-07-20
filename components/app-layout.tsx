"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/language-context";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/components/dashboard";
import Products from "@/components/products";
import Invoices from "@/components/invoices";
import Categories from "@/components/categories";
import Customers from "@/components/customers";
import Settings from "@/components/settings";

export function AppLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <Products />;
      case "invoices":
        return <Invoices />;
      case "categories":
        return <Categories />;
      case "customers":
        return <Customers />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <div className="flex h-screen bg-background text-foreground">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
