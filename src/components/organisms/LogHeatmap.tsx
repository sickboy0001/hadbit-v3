"use client";

import { hadbitlog } from "@/services/hadbitlogs_service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSafeDate } from "@/lib/date-utils";

interface LogHeatmapProps {
  logs: hadbitlog[];
}

export function LogHeatmap({ logs }: LogHeatmapProps) {
  // Generate last 365 days
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

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
    return logs.filter((l) => {
      const logDate = getSafeDate(l.done_at);
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">年間アクティビティ</CardTitle>
      </CardHeader>
      <CardContent>
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
                            className={`w-3 h-3 rounded-sm ${getColor(count)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-bold">
                              {day.toLocaleDateString()}
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
  );
}
