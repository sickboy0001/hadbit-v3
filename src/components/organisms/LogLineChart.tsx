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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, eachDayOfInterval, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import { getSafeDate } from "@/lib/date-utils";

interface LogLineChartProps {
  logs: hadbitlog[];
  categories: CategoryNode[];
  currentDate: Date;
  periodMonths: number;
}

export function LogLineChart({
  logs,
  categories,
  currentDate,
  periodMonths,
}: LogLineChartProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // カテゴリ・項目が読み込まれたら、LocalStorageまたは最初の項目をデフォルト選択する
  useEffect(() => {
    if (selectedItemId) return;

    if (categories.length > 0) {
      const savedId = localStorage.getItem(
        "hadbit_analytics_line_chart_item_id",
      );
      if (savedId) {
        const exists = categories.some((cat) =>
          cat.items.some((i) => String(i.id) === savedId),
        );
        if (exists) {
          setSelectedItemId(savedId);
          return;
        }
      }

      for (const cat of categories) {
        if (cat.items.length > 0) {
          setSelectedItemId(String(cat.items[0].id));
          break;
        }
      }
    }
  }, [categories, selectedItemId]);

  const handleItemChange = (value: string) => {
    setSelectedItemId(value);
    localStorage.setItem("hadbit_analytics_line_chart_item_id", value);
  };

  const chartData = useMemo(() => {
    if (!selectedItemId) return [];
    const itemId = parseInt(selectedItemId);

    // 表示期間の開始日
    const start = subMonths(currentDate, periodMonths);
    // 表示期間の終了日
    const end = new Date(currentDate);

    // 期間内の全日付配列を生成
    const days = eachDayOfInterval({ start, end });

    // データ変換
    const data = days.map((day) => {
      // その日のログを抽出
      const dayLogs = logs.filter((l) => {
        if (l.item_id !== itemId) return false;
        return isSameDay(getSafeDate(l.done_at), day);
      });

      // 数値を抽出
      const validValues = dayLogs
        .map((l) => {
          const match = l.comment?.match(/-?\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : null;
        })
        .filter((v) => v !== null) as number[];

      let value: number | null = null;
      let comment: string | null = null;

      if (validValues.length > 0) {
        // 平均値を計算
        const sum = validValues.reduce((acc, cur) => acc + cur, 0);
        value = Math.round((sum / validValues.length) * 100) / 100;

        if (validValues.length === 1) {
          const sourceLog = dayLogs.find((l) => {
            const m = l.comment?.match(/-?\d+(\.\d+)?/);
            return m && parseFloat(m[0]) === validValues[0];
          });
          comment = sourceLog?.comment || null;
        } else {
          comment = `${validValues.length}件の平均`;
        }
      }

      return {
        id: day.getTime(),
        date: format(day, "MM/dd", { locale: ja }),
        fullDate: format(day, "yyyy/MM/dd", { locale: ja }),
        value: value,
        comment: comment,
      };
    });

    return data;
  }, [logs, selectedItemId, currentDate, periodMonths]);

  const hasData = useMemo(
    () => chartData.some((d) => d.value !== null),
    [chartData],
  );

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            数値記録の推移
          </CardTitle>
          <Select value={selectedItemId} onValueChange={handleItemChange}>
            <SelectTrigger className="w-45 h-8 text-xs">
              <SelectValue placeholder="項目を選択" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectGroup key={cat.id}>
                  <SelectLabel className="text-xs text-muted-foreground">
                    {cat.name}
                  </SelectLabel>
                  {cat.items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-75 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fullDate"
                  tickFormatter={(value) => value.slice(5)}
                />
                <YAxis domain={["auto", "auto"]} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md">
                          <p className="font-semibold text-foreground">
                            {data.fullDate}
                          </p>
                          <div className="mt-1">
                            <p className="text-muted-foreground text-xs mb-0.5">
                              {data.comment || "記録"}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="記録値"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              {selectedItemId
                ? "表示期間内に数値を含む記録がありません"
                : "項目を選択してください"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
