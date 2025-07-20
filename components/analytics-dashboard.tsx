"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  PieChart,
} from "lucide-react";
import { RevenueChart } from "@/components/revenue-chart";
import { TopProductsChart } from "@/components/top-products-chart";
import { InventoryAnalyticsChart } from "@/components/inventory-analytics-chart";
import { SalesPerformanceChart } from "@/components/sales-performance-chart";
import { ProfitMarginChart } from "@/components/profit-margin-chart";
import { useEffect, useState } from "react";
import { getProducts, getInvoices } from "@/lib/database";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";

interface AdvancedStats {
  totalRevenue: number;
  monthlyGrowth: number;
  profitMargin: number;
  inventoryTurnover: number;
  customerRetention: number;
  avgOrderValue: number;
  topSellingProduct: string;
  lowStockAlert: number;
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<AdvancedStats>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    profitMargin: 0,
    inventoryTurnover: 0,
    customerRetention: 0,
    avgOrderValue: 0,
    topSellingProduct: "N/A",
    lowStockAlert: 0,
  });
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchAdvancedStats();
  }, [refreshTrigger]);

  const fetchAdvancedStats = async () => {
    try {
      setLoading(true);
      const [products, invoices] = await Promise.all([
        getProducts(),
        getInvoices(),
      ]);

      // Calculate advanced statistics
      const totalRevenue = invoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0,
      );
      const avgOrderValue =
        invoices.length > 0 ? totalRevenue / invoices.length : 0;

      // Monthly growth calculation
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthRevenue = invoices
        .filter((inv) => {
          const date = new Date(inv.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const lastMonthRevenue = invoices
        .filter((inv) => {
          const date = new Date(inv.date);
          return (
            date.getMonth() === lastMonth &&
            date.getFullYear() === lastMonthYear
          );
        })
        .reduce((sum, inv) => sum + inv.total, 0);

      const monthlyGrowth =
        lastMonthRevenue > 0
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // Top selling product
      const productSales: { [key: string]: number } = {};
      invoices.forEach((invoice) => {
        invoice.items.forEach((item) => {
          productSales[item.product_name] =
            (productSales[item.product_name] || 0) + item.quantity;
        });
      });
      const topSellingProduct =
        Object.entries(productSales).length > 0
          ? Object.entries(productSales).sort(([, a], [, b]) => b - a)[0][0]
          : "N/A";

      // Low stock alert
      const lowStockAlert = products.filter((p) => p.quantity <= 5).length;

      // Profit margin calculation (simplified)
      const totalCost = invoices.reduce((sum, invoice) => {
        return (
          sum +
          invoice.items.reduce((itemSum, item) => {
            const product = products.find((p) => p.id === item.product_id);
            return (
              itemSum + (product ? item.quantity * product.purchase_price : 0)
            );
          }, 0)
        );
      }, 0);
      const profitMargin =
        totalRevenue > 0
          ? ((totalRevenue - totalCost) / totalRevenue) * 100
          : 0;

      // Inventory turnover (simplified)
      const totalInventoryValue = products.reduce(
        (sum, p) => sum + p.quantity * p.purchase_price,
        0,
      );
      const inventoryTurnover =
        totalInventoryValue > 0 ? totalCost / totalInventoryValue : 0;

      setStats({
        totalRevenue,
        monthlyGrowth,
        profitMargin,
        inventoryTurnover,
        customerRetention: 85, // Placeholder - would need customer tracking
        avgOrderValue,
        topSellingProduct,
        lowStockAlert,
      });
    } catch (error) {
      console.error("Failed to fetch advanced stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: "Total Revenue",
      value: formatCurrencyWithSymbol(stats.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      trend: stats.monthlyGrowth,
    },
    {
      title: "Monthly Growth",
      value: `${stats.monthlyGrowth.toFixed(1)}%`,
      icon: stats.monthlyGrowth >= 0 ? TrendingUp : TrendingDown,
      color: stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor:
        stats.monthlyGrowth >= 0
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Profit Margin",
      value: `${stats.profitMargin.toFixed(1)}%`,
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Inventory Turnover",
      value: stats.inventoryTurnover.toFixed(2),
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Avg Order Value",
      value: formatCurrencyWithSymbol(stats.avgOrderValue),
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Top Product",
      value: stats.topSellingProduct,
      icon: PieChart,
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, index) => (
          <Card
            key={card.title}
            className="card-enhanced group relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-20 h-20 ${card.bgColor} rounded-full -translate-y-10 translate-x-10 opacity-50 group-hover:scale-150 transition-transform duration-500`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">
                {loading ? (
                  <div className="loading-skeleton h-6 w-20" />
                ) : (
                  card.value
                )}
              </div>
              {card.trend !== undefined && (
                <p
                  className={`text-xs ${card.trend >= 0 ? "text-green-600" : "text-red-600"} flex items-center mt-1`}
                >
                  {card.trend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(card.trend).toFixed(1)}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <TopProductsChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <SalesPerformanceChart />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InventoryAnalyticsChart />
        <ProfitMarginChart />
      </div>
    </div>
  );
}
