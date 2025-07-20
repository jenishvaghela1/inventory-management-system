"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getInvoices } from "@/lib/database";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

interface ProductSalesData {
  name: string;
  value: number;
  quantity: number;
  color: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
  "#00ffff",
  "#ffff00",
];

export function TopProductsChart() {
  const [productData, setProductData] = useState<ProductSalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchProductData();
  }, [refreshTrigger]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const invoices = await getInvoices();

      // Aggregate product sales
      const productSales: {
        [key: string]: { revenue: number; quantity: number };
      } = {};

      invoices.forEach((invoice) => {
        invoice.items.forEach((item) => {
          if (!productSales[item.product_name]) {
            productSales[item.product_name] = { revenue: 0, quantity: 0 };
          }
          productSales[item.product_name].revenue +=
            item.quantity * item.unit_price;
          productSales[item.product_name].quantity += item.quantity;
        });
      });

      // Convert to array and sort by revenue
      const sortedProducts = Object.entries(productSales)
        .map(([name, data]) => ({
          name,
          value: data.revenue,
          quantity: data.quantity,
          color: "",
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10 products

      // Assign colors
      const productsWithColors = sortedProducts.map((product, index) => ({
        ...product,
        color: COLORS[index % COLORS.length],
      }));

      setProductData(productsWithColors);
    } catch (error) {
      console.error("Failed to fetch product data:", error);
      showToast.error("Failed to load top products chart data");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            Revenue: {formatCurrencyWithSymbol(data.value)}
          </p>
          <p className="text-muted-foreground">
            Quantity Sold: {data.quantity}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Top Products by Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : productData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No sales data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
