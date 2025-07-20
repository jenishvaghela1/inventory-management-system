"use client";

import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  FilePlus,
  ChevronRight,
  Tag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import { useLanguage } from "@/contexts/language-context";
import { MODAL_TYPES } from "@/lib/constants";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { openModal } = useApp();
  const { t } = useLanguage();

  const handleCreateInvoice = () => {
    openModal(MODAL_TYPES.CREATE_INVOICE);
    setActiveTab("invoices");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: t("dashboard"),
      icon: LayoutDashboard,
      action: () => setActiveTab("dashboard"),
      description: "Overview & Analytics",
    },
    {
      id: "products",
      label: t("products"),
      icon: Package,
      action: () => setActiveTab("products"),
      description: "Manage Inventory",
    },
    {
      id: "categories",
      label: "Categories",
      icon: Tag,
      action: () => setActiveTab("categories"),
      description: "Product Categories",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      action: () => setActiveTab("customers"),
      description: "Customer Database",
    },
    {
      id: "invoices",
      label: t("invoices"),
      icon: FileText,
      action: () => setActiveTab("invoices"),
      description: "Sales & Billing",
    },
    {
      id: "settings",
      label: t("settings"),
      icon: Settings,
      action: () => setActiveTab("settings"),
      description: "Configuration",
    },
  ];

  return (
    <div className="w-72 h-full bg-card border-r border-border relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Header */}
      <div className="relative p-6 border-b border-border/50">
        <div className="animate-in fade-in-down">
          <h1 className="text-2xl font-bold gradient-text">
            Inventory Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Professional Edition
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative p-4 space-y-2">
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "animate-in fade-in-up",
              `animation-delay-${index * 100}ms`,
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <button
              onClick={item.action}
              className={cn(
                "group flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              {/* Active indicator */}
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl" />
              )}

              {/* Content */}
              <div className="relative flex items-center w-full">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    activeTab === item.id
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-accent-foreground",
                  )}
                />
                <div className="ml-3 flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={cn(
                      "text-xs transition-colors duration-300",
                      activeTab === item.id
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {item.description}
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-all duration-300",
                    activeTab === item.id
                      ? "text-primary-foreground opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                  )}
                />
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        ))}

        {/* Separator */}
        <div className="my-6 border-t border-border/50" />

        {/* Create Invoice Button */}
        <div
          className="animate-in fade-in-up animation-delay-500ms"
          style={{ animationDelay: "500ms" }}
        >
          <button
            onClick={handleCreateInvoice}
            className="group flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow hover:shadow-glow-sm hover:scale-105 active:scale-95"
          >
            <div className="relative flex items-center w-full">
              <FilePlus className="h-5 w-5" />
              <div className="ml-3 flex-1 text-left">
                <div className="font-medium">Create Invoice</div>
                <div className="text-xs text-primary-foreground/80">
                  New Sale
                </div>
              </div>
              <div className="h-2 w-2 bg-primary-foreground rounded-full animate-pulse" />
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
        <div
          className="animate-in fade-in-up animation-delay-600ms"
          style={{ animationDelay: "600ms" }}
        >
          <div className="text-xs text-muted-foreground text-center">
            <div className="font-medium">v1.0.0</div>
            <div>© {new Date().getFullYear()} Inventory Manager</div>
          </div>
        </div>
      </div>
    </div>
  );
}
