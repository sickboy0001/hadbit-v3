"use client";

import { useState, useEffect, useMemo } from "react";
import { hadbitlog, getHadbitLogs } from "@/services/hadbitlogs_service";
import { CategoryNode } from "@/services/hadbititems_service";
import { LogHeatmap } from "./LogHeatmap";
import { LogStackedBarChart } from "./LogStackedBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import {
  PieChart as PieChartIcon,
  Activity,
  Filter,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { LogLineChart } from "./LogLineChart";

interface LogAnalyticsProps {
  userId: string;
  categories: CategoryNode[];
  lastUpdated?: Date;
}

// グラフ用のカラーパレット
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#8dd1e1",
];

export function LogAnalytics({
  userId,
  categories,
  lastUpdated,
}: LogAnalyticsProps) {
  const [logs, setLogs] = useState<hadbitlog[]>([]);
  const [periodMonths, setPeriodMonths] = useState("6"); // 過去何ヶ月分を表示するか
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<number[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 初期化時にlocalStorageから設定を読み込み
  useEffect(() => {
    const savedExcluded = localStorage.getItem(
      "hadbit_analytics_excluded_categories",
    );
    if (savedExcluded) {
      try {
        setExcludedCategoryIds(JSON.parse(savedExcluded));
      } catch (e) {
        console.error("Failed to parse excluded categories", e);
      }
    }

    const savedPeriod = localStorage.getItem("hadbit_analytics_period_months");
    if (savedPeriod) {
      setPeriodMonths(savedPeriod);
    }
  }, []);

  // カテゴリの表示切り替え
  const toggleCategory = (categoryId: number) => {
    setExcludedCategoryIds((prev) => {
      const newList = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];
      localStorage.setItem(
        "hadbit_analytics_excluded_categories",
        JSON.stringify(newList),
      );
      return newList;
    });
  };

  const handlePeriodChange = (value: string) => {
    setPeriodMonths(value);
    localStorage.setItem("hadbit_analytics_period_months", value);
  };

  const handlePrev = () => {
    setCurrentDate((prev) => subMonths(prev, parseInt(periodMonths)));
  };

  const handleNext = () => {
    setCurrentDate((prev) => addMonths(prev, parseInt(periodMonths)));
  };

  const startDate = useMemo(() => {
    const d = subMonths(currentDate, parseInt(periodMonths));
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate, periodMonths]);

  useEffect(() => {
    const fetchLogs = async () => {
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      try {
        const data = await getHadbitLogs(
          userId,
          startDate.toISOString(),
          end.toISOString(),
        );
        setLogs(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, [userId, periodMonths, currentDate, startDate, lastUpdated]);

  // --- データ加工処理 ---

  // フィルタリングされた有効なカテゴリ
  const activeCategories = useMemo(() => {
    return categories.filter((cat) => !excludedCategoryIds.includes(cat.id));
  }, [categories, excludedCategoryIds]);

  // 1. カテゴリ別集計（円グラフ・レーダーチャート用）
  const categoryData = useMemo(() => {
    const counts: { [key: number]: number } = {};
    logs.forEach((log) => {
      counts[log.category_id] = (counts[log.category_id] || 0) + 1;
    });

    return activeCategories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        value: counts[cat.id] || 0,
        originalIndex: categories.findIndex((c) => c.id === cat.id), // 色固定用
      }))
      .filter((d) => d.value > 0); // データがあるものだけ表示
  }, [logs, activeCategories, categories]);

  return (
    <div className="space-y-8">
      <LogHeatmap
        userId={userId}
        categories={categories}
        lastUpdated={lastUpdated}
      />

      <div className="space-y-6 border-t pt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            分析レポート
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">表示設定</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>集計対象カテゴリ</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((cat) => (
                  <DropdownMenuCheckboxItem
                    key={cat.id}
                    checked={!excludedCategoryIds.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={periodMonths} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">過去3ヶ月</SelectItem>
                <SelectItem value="6">過去6ヶ月</SelectItem>
                <SelectItem value="12">過去1年</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="rounded-r-none px-2 focus:z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none -ml-px border-r-0 px-3 font-normal text-foreground pointer-events-none focus:z-10"
              >
                {format(startDate, "yyyy/MM/dd", { locale: ja })} -{" "}
                {format(currentDate, "yyyy/MM/dd", { locale: ja })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="rounded-l-none -ml-px px-2 focus:z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 円グラフ: 時間配分 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                カテゴリ別配分 (合計)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.originalIndex % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* レーダーチャート: バランス */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                活動バランス
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={categoryData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, "auto"]} />
                    <Radar
                      name="活動数"
                      dataKey="value"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 積層バーチャート: 推移 */}
          <LogStackedBarChart
            logs={logs}
            activeCategories={activeCategories}
            allCategories={categories}
            colors={COLORS}
            currentDate={currentDate}
            periodMonths={parseInt(periodMonths)}
          />
          <LogLineChart
            logs={logs}
            categories={categories}
            currentDate={currentDate}
            periodMonths={parseInt(periodMonths)}
          />
        </div>
      </div>
    </div>
  );
}
