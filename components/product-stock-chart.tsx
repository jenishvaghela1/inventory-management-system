"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getProducts } from "@/lib/database";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";
import { truncateText } from "@/lib/utils";

interface StockData {
  name: string;
  stock: number;
  status: "good" | "low" | "out";
}

export function ProductStockChart() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchStockData();
  }, [refreshTrigger]);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const products = await getProducts();

      // Take top 10 products by stock quantity
      const topProducts = products
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)
        .map((product) => ({
          name: truncateText(product.name, 15),
          stock: product.quantity,
          status:
            product.quantity === 0
              ? "out"
              : product.quantity <= 5
                ? "low"
                : "good",
        }));

      setStockData(topProducts);
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
      showToast.error("Failed to load product stock chart data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Product Stock Levels (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="stock"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
