"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { History } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getSafeDate } from "@/lib/date-utils";

interface LogHistoryProps {
  logs: hadbitlog[];
  onLogClick: (log: hadbitlog) => void;
}

export function LogHistory({ logs, onLogClick }: LogHistoryProps) {
  const groupedLogs = useMemo(() => {
    const groups: { date: string; logs: hadbitlog[] }[] = [];
    logs.forEach((log) => {
      // UTCとして解釈するために、末尾にZがない場合は付与する
      const dateObj = getSafeDate(log.done_at);
      const date = format(dateObj, "yyyy/MM/dd(EEE)", { locale: ja });
      let group = groups.find((g) => g.date === date);
      if (!group) {
        group = { date, logs: [] };
        groups.push(group);
      }
      group.logs.push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2 px-1">
        <History className="h-5 w-5 text-primary" />
        記録
      </h2>

      {logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            記録はありません。
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {groupedLogs.map((group) => (
            <Card key={group.date} className="h-fit shadow-sm overflow-hidden">
              <div
                className={`px-3 py-0.5 bg-muted/20 text-sm font-bold text-left border-b ${
                  group.date.includes("土")
                    ? "text-blue-600"
                    : group.date.includes("日")
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {group.date}
              </div>
              {/* CardContentは使わず、直接divで囲むのが一番確実です。
              shadcnのCardContentにはデフォルトで padding-top が設定されていることが多いためです。
            */}
              <div className="px-2 py-0">
                {group.logs.map((log) => (
                  <div
                    key={log.log_id}
                    className="px-3 py-0.5 text-sm group relative hover:bg-muted/50 transition-colors border-b last:border-0 cursor-pointer"
                    onClick={() => onLogClick(log)}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-semibold truncate flex-1">
                        <span className="text-muted-foreground font-normal mr-1 text-[10px]">
                          [{log.category_name}]
                        </span>
                        {log.master_name}
                        {log.comment && (
                          <span className="text-muted-foreground font-normal ml-2 text-[10px]">
                            {log.comment}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {format(getSafeDate(log.done_at), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
