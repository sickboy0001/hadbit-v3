"use client";

import { Fragment } from "react";
import { CategoryNode } from "@/services/hadbititems_service";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getSafeDate } from "@/lib/date-utils";

interface LogDateGridProps {
  logs: hadbitlog[];
  categories: CategoryNode[];
}

export function LogDateGrid({ logs, categories }: LogDateGridProps) {
  // Generate last 14 days (right is newer)
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isLogged = (itemId: number, date: Date) => {
    return logs.some((l) => {
      if (l.item_id !== itemId) return false;
      const logDate = getSafeDate(l.done_at);
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    });
  };

  return (
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
                      <span className="text-xs">{date.getMonth() + 1}/</span>
                      <span className="font-bold">{date.getDate()}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Fragment key={category.id}>
                <tr key={`cat-${category.id}`} className="bg-muted/20">
                  <td className="p-2 font-semibold text-xs text-muted-foreground sticky left-0 z-10 bg-muted/20">
                    {category.name}
                  </td>
                  <td colSpan={dates.length} />
                </tr>
                {category.items.map((item) => (
                  <tr
                    key={`item-${item.id}`}
                    className="border-b last:border-0"
                  >
                    <td className="p-2 font-medium sticky left-0 bg-background z-10 truncate max-w-37.5">
                      {item.name}
                    </td>
                    {dates.map((date) => {
                      const checked = isLogged(item.id, date);
                      const isTodayDate = isToday(date);
                      return (
                        <td
                          key={date.toISOString()}
                          className={`p-1 text-center border-l border-dashed ${
                            isTodayDate ? "bg-primary/10" : ""
                          }`}
                        >
                          {checked && (
                            <div className="flex justify-center">
                              <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
            {categories.length === 0 && (
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
  );
}
