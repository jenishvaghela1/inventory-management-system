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
  Legend,
} from "recharts";
import { getProducts, getInvoices } from "@/lib/database";
import { formatCurrency } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

interface ProfitData {
  productName: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  unitsSold: number;
}

export function ProfitMarginChart() {
  const [profitData, setProfitData] = useState<ProfitData[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchProfitData();
  }, [refreshTrigger]);

  const fetchProfitData = async () => {
    try {
      setLoading(true);
      const [products, invoices] = await Promise.all([
        getProducts(),
        getInvoices(),
      ]);

      // Calculate profit for each product
      const productProfits: { [key: string]: ProfitData } = {};

      // Initialize with product data
      products.forEach((product) => {
        productProfits[product.name] = {
          productName: product.name,
          revenue: 0,
          cost: 0,
          profit: 0,
          margin: 0,
          unitsSold: 0,
        };
      });

      // Calculate sales data
      invoices.forEach((invoice) => {
        invoice.items.forEach((item) => {
          const product = products.find((p) => p.id === item.product_id);
          if (product && productProfits[item.product_name]) {
            const revenue = item.quantity * item.unit_price;
            const cost = item.quantity * product.purchase_price;

            productProfits[item.product_name].revenue += revenue;
            productProfits[item.product_name].cost += cost;
            productProfits[item.product_name].unitsSold += item.quantity;
          }
        });
      });

      // Calculate profit and margin
      const profitArray = Object.values(productProfits)
        .map((item) => ({
          ...item,
          profit: item.revenue - item.cost,
          margin:
            item.revenue > 0
              ? ((item.revenue - item.cost) / item.revenue) * 100
              : 0,
        }))
        .filter((item) => item.unitsSold > 0) // Only show products that have been sold
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10); // Top 10 by profit

      setProfitData(profitArray);
    } catch (error) {
      console.error("Failed to fetch profit data:", error);
      showToast.error("Failed to load profit margin data");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <p className="text-green-600">
            Revenue: {formatCurrency(data.revenue)}
          </p>
          <p className="text-red-600">Cost: {formatCurrency(data.cost)}</p>
          <p className="text-primary">Profit: {formatCurrency(data.profit)}</p>
          <p className="text-muted-foreground">
            Margin: {data.margin.toFixed(1)}%
          </p>
          <p className="text-muted-foreground">Units Sold: {data.unitsSold}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Profit Analysis by Product</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : profitData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No sales data available for profit analysis
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={profitData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="productName"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
              <Bar dataKey="cost" fill="#ff7300" name="Cost" />
              <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
