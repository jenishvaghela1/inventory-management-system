"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
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

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshTrigger } = useApp();

  useEffect(() => {
    fetchRevenueData();
  }, [refreshTrigger]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const invoices = await getInvoices();

      // Get last 12 months
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          fullDate: date,
        };
      }).reverse();

      const revenueByMonth = last12Months.map(({ month, fullDate }) => {
        const monthInvoices = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.date);
          return (
            invoiceDate.getMonth() === fullDate.getMonth() &&
            invoiceDate.getFullYear() === fullDate.getFullYear()
          );
        });

        const revenue = monthInvoices.reduce(
          (sum, invoice) => sum + invoice.total,
          0,
        );
        const orders = monthInvoices.length;
        const avgOrderValue = orders > 0 ? revenue / orders : 0;

        return {
          month,
          revenue,
          orders,
          avgOrderValue,
        };
      });

      setRevenueData(revenueByMonth);
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
      showToast.error("Failed to load revenue chart data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="loading-spinner h-8 w-8" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue"
                    ? formatCurrencyWithSymbol(value as number)
                    : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
