"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getProducts } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

interface InventoryAnalyticsData {
  category: string;
  totalValue: number;
  quantity: number;
  avgPrice: number;
  lowStockItems: number;
}

export function InventoryAnalyticsChart() {
  const [analyticsData, setAnalyticsData] = useState<InventoryAnalyticsData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchAnalyticsData();
  }, [refreshTrigger]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const products = await getProducts();

      // Group products by price range (categories)
      const priceRanges = [
        { name: "Budget (0-100)", min: 0, max: 100 },
        { name: "Mid-range (100-500)", min: 100, max: 500 },
        { name: "Premium (500-1000)", min: 500, max: 1000 },
        { name: "Luxury (1000+)", min: 1000, max: Number.POSITIVE_INFINITY },
      ];

      const analytics = priceRanges
        .map((range) => {
          const rangeProducts = products.filter(
            (product) =>
              product.selling_price >= range.min &&
              product.selling_price < range.max,
          );

          const totalValue = rangeProducts.reduce(
            (sum, product) => sum + product.selling_price * product.quantity,
            0,
          );
          const quantity = rangeProducts.reduce(
            (sum, product) => sum + product.quantity,
            0,
          );
          const avgPrice =
            rangeProducts.length > 0
              ? rangeProducts.reduce(
                  (sum, product) => sum + product.selling_price,
                  0,
                ) / rangeProducts.length
              : 0;
          const lowStockItems = rangeProducts.filter(
            (product) => product.quantity <= 5,
          ).length;

          return {
            category: range.name,
            totalValue,
            quantity,
            avgPrice,
            lowStockItems,
          };
        })
        .filter((item) => item.quantity > 0); // Only show categories with products

      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      showToast.error("Failed to load inventory analytics data");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.dataKey === "totalValue" || entry.dataKey === "avgPrice"
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Inventory Analytics by Price Range</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : analyticsData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No inventory data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={analyticsData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="quantity"
                fill="hsl(var(--primary))"
                name="Quantity"
              />
              <Bar
                yAxisId="left"
                dataKey="lowStockItems"
                fill="#ff7300"
                name="Low Stock Items"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgPrice"
                stroke="#8884d8"
                name="Avg Price"
                strokeWidth={3}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
