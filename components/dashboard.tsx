"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Plus,
  Eye,
} from "lucide-react";
import { getDashboardStats, getProducts, getInvoices } from "@/lib/database";
import { useApp } from "@/contexts/app-context";
import { SalesChart } from "@/components/sales-chart";
import { ProductStockChart } from "@/components/product-stock-chart";
import { RecentInvoices } from "@/components/recent-invoices";
import { MODAL_TYPES } from "@/lib/constants";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import showToast from "@/lib/toast";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { useSettings } from "@/contexts/settings-context";
import { useLanguage } from "@/contexts/language-context";

interface DashboardStats {
  productCount: number;
  totalStock: number;
  monthlySales: number;
  lowStockCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function Dashboard() {
  const { openModal, refreshTrigger } = useApp();
  const { getCurrencyInfo } = useSettings();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    totalStock: 0,
    monthlySales: 0,
    lowStockCount: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await getDashboardStats();
      const products = await getProducts();
      const invoices = await getInvoices();

      const lowStockCount = products.filter(
        (p) => p.quantity <= p.lowStockThreshold,
      ).length;
      const totalRevenue = invoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0,
      );
      const averageOrderValue =
        invoices.length > 0 ? totalRevenue / invoices.length : 0;

      setStats({
        productCount: dashboardStats.productCount,
        totalStock: dashboardStats.totalStock,
        monthlySales: dashboardStats.recentSales, // Map recentSales to monthlySales
        lowStockCount,
        totalRevenue,
        averageOrderValue,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      showToast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t("dashboard.totalProducts"),
      value: stats.productCount,
      description: "Unique products in inventory",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      delay: 0,
    },
    {
      title: t("dashboard.totalStock"),
      value: stats.totalStock,
      description: "Total items in inventory",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      delay: 100,
    },
    {
      title: t("dashboard.recentSales"),
      value: formatCurrencyWithSymbol(
        stats.monthlySales,
        getCurrencyInfo().CODE,
        getCurrencyInfo().SYMBOL,
      ),
      description: "Sales this month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      delay: 200,
    },
    {
      title: t("dashboard.totalRevenue"),
      value: formatCurrencyWithSymbol(
        stats.totalRevenue,
        getCurrencyInfo().CODE,
        getCurrencyInfo().SYMBOL,
      ),
      description: "All-time revenue",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      delay: 300,
    },
    {
      title: "Average Order",
      value: formatCurrencyWithSymbol(
        stats.averageOrderValue,
        getCurrencyInfo().CODE,
        getCurrencyInfo().SYMBOL,
      ),
      description: "Average order value",
      icon: Users,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      delay: 400,
    },
    {
      title: t("dashboard.lowStockAlert"),
      value: stats.lowStockCount,
      description: t("dashboard.lowStockDescription"),
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      delay: 500,
      clickable: true,
      onClick: () => openModal(MODAL_TYPES.LOW_STOCK),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="animate-in fade-in-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text">
                {t("dashboard.title")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("dashboard.welcome")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => openModal(MODAL_TYPES.CREATE_PRODUCT)}
                className="btn-enhanced group"
              >
                <Package className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                {t("products.addProduct")}
              </Button>
              <Button
                onClick={() => openModal(MODAL_TYPES.CREATE_INVOICE)}
                className="btn-enhanced bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group"
              >
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                {t("invoices.createInvoice")}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className={`animate-in fade-in-up`}
              style={{ animationDelay: `${card.delay}ms` }}
            >
              <Card
                className={`card-enhanced ${card.clickable ? "card-interactive" : ""} group relative overflow-hidden`}
                onClick={card.onClick}
              >
                <div
                  className={`absolute top-0 right-0 w-20 h-20 ${card.bgColor} rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:scale-150 transition-transform duration-500`}
                />

                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {card.title}
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <div className="text-3xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300">
                    {loading ? (
                      <div className="loading-skeleton h-8 w-24" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                    {card.description}
                  </p>

                  {card.clickable && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Analytics Toggle */}
        <div
          className="animate-in fade-in-up animation-delay-600ms"
          style={{ animationDelay: "600ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {t("dashboard.analytics")}
            </h2>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="btn-enhanced"
            >
              {showAdvancedAnalytics
                ? t("dashboard.hideAnalytics")
                : t("dashboard.showAnalytics")}
            </Button>
          </div>
        </div>

        {/* Conditional Analytics Display */}
        {showAdvancedAnalytics ? (
          <div
            className="animate-in fade-in-up animation-delay-700ms"
            style={{ animationDelay: "700ms" }}
          >
            <AnalyticsDashboard />
          </div>
        ) : (
          <>
            {/* Basic Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <div
                className="animate-in fade-in-up animation-delay-600ms"
                style={{ animationDelay: "600ms" }}
              >
                <SalesChart />
              </div>
              <div
                className="animate-in fade-in-up animation-delay-700ms"
                style={{ animationDelay: "700ms" }}
              >
                <ProductStockChart />
              </div>
            </div>

            {/* Recent Activity */}
            <div
              className="animate-in fade-in-up animation-delay-800ms"
              style={{ animationDelay: "800ms" }}
            >
              <RecentInvoices />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
