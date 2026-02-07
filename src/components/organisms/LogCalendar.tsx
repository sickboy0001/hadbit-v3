"use client";

import { useState } from "react";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSafeDate } from "@/lib/date-utils";

interface LogCalendarProps {
  logs: hadbitlog[];
  onLogClick: (log: hadbitlog) => void;
}

export function LogCalendar({ logs, onLogClick }: LogCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

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
      days.push(<div key={`empty-${i}`} className="h-24 bg-muted/5" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;

      // Filter logs for this day
      const dayLogs = logs.filter((l) => {
        const logDate = getSafeDate(l.done_at);
        return (
          logDate.getFullYear() === year &&
          logDate.getMonth() === month &&
          logDate.getDate() === d
        );
      });

      days.push(
        <div
          key={dateStr}
          className="h-24 border border-muted/50 p-1 flex flex-col gap-1 overflow-hidden hover:bg-muted/10 transition-colors"
        >
          <span
            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
              dayLogs.length > 0
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {d}
          </span>
          <div className="flex flex-col gap-0.5 overflow-y-auto no-scrollbar">
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
          {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
            <div
              key={w}
              className="text-center text-xs text-muted-foreground py-1"
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
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-mono text-sm text-muted-foreground">
          Displaying: {currentDate.getFullYear()}/{currentDate.getMonth() + 1} &{" "}
          {prevDate.getFullYear()}/{prevDate.getMonth() + 1}
        </span>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Current Month (Top) */}
          {renderMonth(currentDate.getFullYear(), currentDate.getMonth())}

          <div className="border-t my-6" />

          {/* Previous Month (Bottom) */}
          {renderMonth(prevDate.getFullYear(), prevDate.getMonth())}
        </CardContent>
      </Card>
    </div>
  );
}
