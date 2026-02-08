"use client";

import { useState, useEffect, useMemo } from "react";
import { CategoryNode } from "@/services/hadbititems_service";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  subMonths,
  eachMonthOfInterval,
  eachWeekOfInterval,
  isSameMonth,
  isSameWeek,
} from "date-fns";
import { ja } from "date-fns/locale";
import { BarChart3 } from "lucide-react";
import { getSafeDate } from "@/lib/date-utils";

interface LogStackedBarChartProps {
  logs: hadbitlog[];
  activeCategories: CategoryNode[];
  allCategories: CategoryNode[];
  colors: string[];
  currentDate: Date;
  periodMonths: number;
}

export function LogStackedBarChart({
  logs,
  activeCategories,
  allCategories,
  colors,
  currentDate,
  periodMonths,
}: LogStackedBarChartProps) {
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");

  useEffect(() => {
    const savedBarChartPeriod = localStorage.getItem(
      "hadbit_analytics_bar_chart_period",
    );
    if (savedBarChartPeriod === "monthly" || savedBarChartPeriod === "weekly") {
      setPeriod(savedBarChartPeriod);
    }
  }, []);

  const handlePeriodChange = (value: "monthly" | "weekly") => {
    setPeriod(value);
    localStorage.setItem("hadbit_analytics_bar_chart_period", value);
  };

  const data = useMemo(() => {
    const end = currentDate;
    const start = subMonths(currentDate, periodMonths - 1);

    if (period === "weekly") {
      const weeks = eachWeekOfInterval({ start, end }, { locale: ja });
      return weeks.map((weekDate) => {
        const weekLogs = logs.filter((l) =>
          isSameWeek(getSafeDate(l.done_at), weekDate, { locale: ja }),
        );
        const d: any = {
          name: format(weekDate, "MM/dd", { locale: ja }),
        };
        activeCategories.forEach((cat) => {
          d[cat.name] = weekLogs.filter((l) => l.category_id === cat.id).length;
        });
        return d;
      });
    }

    const months = eachMonthOfInterval({ start, end });
    return months.map((month) => {
      const monthLogs = logs.filter((l) =>
        isSameMonth(getSafeDate(l.done_at), month),
      );
      const d: any = {
        name: format(month, "yyyy/MM", { locale: ja }),
      };
      activeCategories.forEach((cat) => {
        d[cat.name] = monthLogs.filter((l) => l.category_id === cat.id).length;
      });
      return d;
    });
  }, [logs, activeCategories, periodMonths, currentDate, period]);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            推移・積み上げ棒グラフ
          </CardTitle>
          <Select
            value={period}
            onValueChange={(v) => handlePeriodChange(v as "monthly" | "weekly")}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">月次</SelectItem>
              <SelectItem value="weekly">週次</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {activeCategories.map((cat) => {
                const originalIndex = allCategories.findIndex(
                  (c) => c.id === cat.id,
                );
                return (
                  <Bar
                    key={cat.id}
                    dataKey={cat.name}
                    stackId="a"
                    fill={colors[originalIndex % colors.length]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
