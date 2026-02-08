"use client";

import { useState, useEffect } from "react";
import { hadbitlog, getHadbitLogs } from "@/services/hadbitlogs_service";
import { CategoryNode } from "@/services/hadbititems_service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSafeDate, toJST } from "@/lib/date-utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";

interface LogHeatmapProps {
  userId: string;
  categories: CategoryNode[];
  lastUpdated?: Date;
}

export function LogHeatmap({
  userId,
  categories,
  lastUpdated,
}: LogHeatmapProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<hadbitlog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);

      const start = new Date(currentDate);
      start.setDate(start.getDate() - 365);
      start.setHours(0, 0, 0, 0);

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

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const filteredLogs =
    selectedCategoryId === "all"
      ? logs
      : logs.filter((l) => l.category_id === selectedCategoryId);

  // Generate last 365 days ending at currentDate
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  const startDate = days[0];

  // Group by week for grid layout (columns are weeks, rows are days)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  days.forEach((day) => {
    if (day.getDay() === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const getDayLogs = (date: Date) => {
    return filteredLogs.filter((l) => {
      const logDate = toJST(getSafeDate(l.done_at));
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    });
  };

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count <= 1) return "bg-primary/20";
    if (count <= 3) return "bg-primary/40";
    if (count <= 5) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 px-1">
          <Activity className="h-5 w-5 text-primary" />
          年間アクティビティ
        </h2>

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
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
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

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map((day, dIndex) => {
                    const dayLogs = getDayLogs(day);
                    const count = dayLogs.length;
                    return (
                      <TooltipProvider key={day.toISOString()}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-[2px] ${getColor(count)}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <p className="font-bold">
                                {format(day, "yyyy/MM/dd(EEE)", { locale: ja })}
                              </p>
                              <p>{count} items completed</p>
                              {dayLogs.length > 0 && (
                                <ul className="mt-1 list-disc list-inside opacity-80">
                                  {dayLogs.map((log) => (
                                    <li key={log.log_id}>{log.master_name}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="w-3 h-3 bg-muted rounded-sm" />
            <div className="w-3 h-3 bg-primary/20 rounded-sm" />
            <div className="w-3 h-3 bg-primary/40 rounded-sm" />
            <div className="w-3 h-3 bg-primary/70 rounded-sm" />
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
