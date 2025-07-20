"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getInvoices } from "@/lib/database";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchSalesData();
  }, [refreshTrigger]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const invoices = await getInvoices();

      // Group invoices by date for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      const salesByDate = last7Days.map((date) => {
        const dayInvoices = invoices.filter((invoice) => invoice.date === date);
        return {
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          sales: dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
          orders: dayInvoices.length,
        };
      });

      setSalesData(salesByDate);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      showToast.error("Failed to load sales chart data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "sales"
                    ? formatCurrencyWithSymbol(value as number)
                    : value,
                  name === "sales" ? "Sales" : "Orders",
                ]}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
