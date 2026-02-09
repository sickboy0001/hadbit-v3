"use client";

import { Fragment, useState, useEffect } from "react";
import { CategoryNode } from "@/services/hadbititems_service";
import { hadbitlog, getHadbitLogs } from "@/services/hadbitlogs_service";
import { ChevronLeft, ChevronRight, Table2, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getSafeDate, toJST } from "@/lib/date-utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LogDateGridProps {
  userId: string;
  categories: CategoryNode[];
  lastUpdated?: Date;
}

export function LogDateGrid({
  userId,
  categories,
  lastUpdated,
}: LogDateGridProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<hadbitlog[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("hadbit_log_dategrid_enabled");
    if (saved !== null) {
      setIsEnabled(saved === "true");
    }
  }, []);

  const handleSwitchChange = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem("hadbit_log_dategrid_enabled", String(checked));
  };

  useEffect(() => {
    const fetchLogs = async () => {
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - 20); // 14日前まで含むように少し余裕を持つ
      try {
        const data = await getHadbitLogs(
          userId,
          start.toISOString(),
          end.toISOString(),
        );
        setLogs(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLogs();
  }, [userId, currentDate, lastUpdated]);

  const displayCategories =
    selectedCategoryId === "all"
      ? categories
      : categories.filter((c) => c.id === selectedCategoryId);

  // Generate last 14 days (right is newer)
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 14);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 14);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getLog = (itemId: number, date: Date) => {
    return logs.find((l) => {
      if (l.item_id !== itemId) return false;
      const logDate = toJST(getSafeDate(l.done_at));
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 px-1">
            <Table2 className="h-5 w-5 text-primary" />
            日付
          </h3>
          <Switch checked={isEnabled} onCheckedChange={handleSwitchChange} />
        </div>

        {isEnabled && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-0">
              <Button
                variant={selectedCategoryId === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId("all")}
                className="rounded-r-none focus:z-10"
              >
                全て
              </Button>
              {categories.map((cat, index) => (
                <Button
                  key={cat.id}
                  variant={
                    selectedCategoryId === cat.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`rounded-none -ml-px focus:z-10 ${index === categories.length - 1 ? "rounded-r-md" : ""}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevDate}
                className="rounded-r-none px-2 focus:z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none -ml-px border-r-0 px-3 font-normal text-foreground pointer-events-none focus:z-10"
              >
                {format(dates[0], "yyyy/MM/dd", { locale: ja })} -{" "}
                {format(dates[dates.length - 1], "yyyy/MM/dd", { locale: ja })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="rounded-none -ml-px border-r-0 px-3 focus:z-10"
              >
                今日
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDate}
                className="rounded-l-none -ml-px px-2 focus:z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {isEnabled && (
        <Card>
          <CardContent className="p-4 overflow-auto max-h-[70vh]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 text-left min-w-37.5 bg-muted sticky left-0 top-0 z-30">
                    項目
                  </th>
                  {dates.map((date) => {
                    const day = date.getDay();
                    const isTodayDate = isToday(date);
                    const colorClass =
                      day === 0
                        ? "text-red-600"
                        : day === 6
                          ? "text-blue-600"
                          : "text-muted-foreground";
                    return (
                      <th
                        key={date.toISOString()}
                        className={`p-2 text-center min-w-10 font-normal ${colorClass} ${
                          isTodayDate ? "bg-primary/20" : "bg-muted"
                        } sticky top-0 z-20`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs">
                            {date.getMonth() + 1}/
                          </span>
                          <span className="font-bold">{date.getDate()}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {displayCategories.map((category) => (
                  <Fragment key={category.id}>
                    <tr key={`cat-${category.id}`} className="bg-muted/20">
                      <td className="p-2 font-semibold text-xs text-muted-foreground sticky left-0 z-10 bg-muted/20">
                        {category.name}
                      </td>
                      <td colSpan={dates.length} />
                    </tr>
                    {category.items.map((item) => {
                      let iconName = "";
                      let colorValue = "";
                      try {
                        if (item.item_style) {
                          const parsed =
                            typeof item.item_style === "string"
                              ? JSON.parse(item.item_style)
                              : item.item_style;
                          iconName = parsed?.style?.icon || parsed?.icon || "";
                          colorValue =
                            parsed?.style?.color || parsed?.color || "";
                        }
                      } catch (e) {}
                      const Icon = iconName
                        ? (LucideIcons as any)[iconName]
                        : Check;

                      return (
                        <tr
                          key={`item-${item.id}`}
                          className="border-b last:border-0"
                        >
                          <td className="p-2 font-medium sticky left-0 bg-background z-10 truncate max-w-37.5">
                            {item.name}
                          </td>
                          {dates.map((date) => {
                            const log = getLog(item.id, date);
                            const isTodayDate = isToday(date);
                            return (
                              <td
                                key={date.toISOString()}
                                className={`p-1 text-center border-l border-dashed ${
                                  isTodayDate ? "bg-primary/10" : ""
                                }`}
                              >
                                {log && (
                                  <div className="flex justify-center">
                                    {log.comment ? (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div
                                              className="h-6 w-6 rounded-full flex items-center justify-center cursor-help"
                                              style={{
                                                backgroundColor: colorValue
                                                  ? `${colorValue}1A`
                                                  : undefined,
                                              }}
                                            >
                                              <Icon
                                                className="h-4 w-4"
                                                style={{
                                                  color:
                                                    colorValue || undefined,
                                                }}
                                              />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p className="max-w-xs break-words">
                                              {log.comment}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    ) : (
                                      <div
                                        className="h-6 w-6 rounded-full flex items-center justify-center"
                                        style={{
                                          backgroundColor: colorValue
                                            ? `${colorValue}1A`
                                            : undefined,
                                        }}
                                      >
                                        <Icon
                                          className="h-4 w-4"
                                          style={{
                                            color: colorValue || undefined,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
                {displayCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={dates.length + 1}
                      className="p-8 text-center text-muted-foreground"
                    >
                      表示する項目がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
