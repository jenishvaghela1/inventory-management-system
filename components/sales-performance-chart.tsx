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
  Legend,
} from "recharts";
import { getInvoices } from "@/lib/database";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import showToast from "@/lib/toast";
import { useApp } from "@/contexts/app-context";

interface SalesPerformanceData {
  date: string;
  dailySales: number;
  cumulativeSales: number;
  orderCount: number;
  avgOrderValue: number;
}

export function SalesPerformanceChart() {
  const [performanceData, setPerformanceData] = useState<
    SalesPerformanceData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchPerformanceData();
  }, [refreshTrigger]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const invoices = await getInvoices();

      // Get last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      }).reverse();

      let cumulativeTotal = 0;
      const performance = last30Days.map((date) => {
        const dayInvoices = invoices.filter((invoice) => invoice.date === date);
        const dailySales = dayInvoices.reduce(
          (sum, invoice) => sum + invoice.total,
          0,
        );
        const orderCount = dayInvoices.length;
        const avgOrderValue = orderCount > 0 ? dailySales / orderCount : 0;

        cumulativeTotal += dailySales;

        return {
          date: new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          dailySales,
          cumulativeSales: cumulativeTotal,
          orderCount,
          avgOrderValue,
        };
      });

      setPerformanceData(performance);
    } catch (error) {
      console.error("Failed to fetch performance data:", error);
      showToast.error("Failed to load sales performance data");
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
              {entry.dataKey.includes("Sales") ||
              entry.dataKey === "avgOrderValue"
                ? formatCurrencyWithSymbol(entry.value)
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
        <CardTitle>Sales Performance (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="dailySales"
                stroke="hsl(var(--primary))"
                name="Daily Sales"
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cumulativeSales"
                stroke="#82ca9d"
                name="Cumulative Sales"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orderCount"
                stroke="#8884d8"
                name="Order Count"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
