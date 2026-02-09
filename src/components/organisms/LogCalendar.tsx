"use client";

import { useState, useEffect } from "react";
import { hadbitlog, getHadbitLogs } from "@/services/hadbitlogs_service";
import { CategoryNode } from "@/services/hadbititems_service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { getSafeDate, toJST } from "@/lib/date-utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface LogCalendarProps {
  userId: string;
  categories: CategoryNode[];
  onLogClick: (log: hadbitlog) => void;
  lastUpdated?: Date;
}

export function LogCalendar({
  userId,
  categories,
  onLogClick,
  lastUpdated,
}: LogCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [logs, setLogs] = useState<hadbitlog[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("hadbit_log_calendar_enabled");
    if (saved !== null) {
      setIsEnabled(saved === "true");
    }
  }, []);

  const handleSwitchChange = (checked: boolean) => {
    setIsEnabled(checked);
    localStorage.setItem("hadbit_log_calendar_enabled", String(checked));
  };

  useEffect(() => {
    const fetchLogs = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      // 先月の1日から
      const start = new Date(year, month - 1, 1);
      // 今月の末日まで
      const end = new Date(year, month + 1, 0);
      end.setHours(23, 59, 59, 999);

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

  const filteredLogs =
    selectedCategoryId === "all"
      ? logs
      : logs.filter((l) => l.category_id === selectedCategoryId);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const renderMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun

    const days = [];
    // Empty slots for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 bg-muted/5" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;
      const dayOfWeek = new Date(year, month, d).getDay();

      // Filter logs for this day
      const dayLogs = filteredLogs.filter((l) => {
        const logDate = toJST(getSafeDate(l.done_at));
        return (
          logDate.getFullYear() === year &&
          logDate.getMonth() === month &&
          logDate.getDate() === d
        );
      });

      days.push(
        <div
          key={dateStr}
          className="min-h-24 h-auto border border-muted/50 p-1 flex flex-col gap-1 hover:bg-muted/10 transition-colors"
        >
          <span
            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
              dayLogs.length > 0
                ? "bg-primary text-primary-foreground"
                : dayOfWeek === 0
                  ? "text-red-600"
                  : dayOfWeek === 6
                    ? "text-blue-600"
                    : "text-muted-foreground"
            }`}
          >
            {d}
          </span>
          <div className="flex flex-col gap-0.5">
            {dayLogs.map((log) => (
              <div
                key={log.log_id}
                className="text-[10px] bg-primary/10 text-primary px-1 rounded truncate cursor-pointer hover:bg-primary/20 transition-colors"
                title={log.master_name}
                onClick={(e) => {
                  e.stopPropagation();
                  onLogClick(log);
                }}
              >
                {log.master_name}
              </div>
            ))}
          </div>
        </div>,
      );
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 ml-1">
          {year}年 {month + 1}月
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {["日", "月", "火", "水", "木", "金", "土"].map((w, index) => (
            <div
              key={w}
              className={`text-center text-xs py-1 ${
                index === 0
                  ? "text-red-600"
                  : index === 6
                    ? "text-blue-600"
                    : "text-muted-foreground"
              }`}
            >
              {w}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const prevDate = new Date(currentDate);
  prevDate.setMonth(prevDate.getMonth() - 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 px-1">
            <CalendarIcon className="h-5 w-5 text-primary" />
            カレンダー
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
                {format(prevDate, "yyyy/MM", { locale: ja })} -{" "}
                {format(currentDate, "yyyy/MM", { locale: ja })}
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
        )}
      </div>

      {isEnabled && (
        <Card>
          <CardContent className="p-4">
            {/* Current Month (Top) */}
            {renderMonth(currentDate.getFullYear(), currentDate.getMonth())}

            <div className="border-t my-6" />

            {/* Previous Month (Bottom) */}
            {renderMonth(prevDate.getFullYear(), prevDate.getMonth())}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
