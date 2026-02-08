"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { hadbitlog, getHadbitLogs } from "@/services/hadbitlogs_service";
import { CategoryNode } from "@/services/hadbititems_service";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getSafeDate, toJST } from "@/lib/date-utils";
import { toast } from "sonner";

interface LogHistoryProps {
  userId: string;
  categories: CategoryNode[];
  onLogClick: (log: hadbitlog) => void;
  lastUpdated?: Date;
}

export function LogHistory({
  userId,
  categories,
  onLogClick,
  lastUpdated,
}: LogHistoryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState<hadbitlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // 基準日（currentDate）から4週間前（27日前）を開始日とする
  const startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - 27);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const end = new Date(currentDate);
        end.setHours(23, 59, 59, 999);
        const start = new Date(end);
        start.setDate(start.getDate() - 27);
        const data = await getHadbitLogs(
          userId,
          start.toISOString(),
          end.toISOString(),
        );
        setLogs(data);
      } catch (e) {
        console.error("Failed to fetch logs", e);
        toast.error("記録の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [userId, currentDate, lastUpdated]);

  const filteredLogs = useMemo(() => {
    // 比較用に時刻をクリアしたDateオブジェクトを作成
    const end = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const start = new Date(end);
    start.setDate(start.getDate() - 27);

    return logs.filter((l) => {
      if (
        selectedCategoryId !== "all" &&
        l.category_id !== selectedCategoryId
      ) {
        return false;
      }
      const logDate = toJST(getSafeDate(l.done_at));
      const target = new Date(
        logDate.getFullYear(),
        logDate.getMonth(),
        logDate.getDate(),
      );

      return target >= start && target <= end;
    });
  }, [logs, selectedCategoryId, currentDate]);

  const groupedLogs = useMemo(() => {
    const groups: { date: string; dateObj: Date; logs: hadbitlog[] }[] = [];
    filteredLogs.forEach((log) => {
      // UTCとして解釈するために、末尾にZがない場合は付与する
      const dateObj = toJST(getSafeDate(log.done_at));
      const date = format(dateObj, "yyyy/MM/dd(EEE)", { locale: ja });
      let group = groups.find((g) => g.date === date);
      if (!group) {
        // ソート用に日付オブジェクトも保持
        const dateKey = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
        );
        group = { date, dateObj: dateKey, logs: [] };
        groups.push(group);
      }
      group.logs.push(log);
    });
    // 日付の降順（新しい順）にソート
    return groups.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [filteredLogs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2 px-1">
          <History className="h-5 w-5 text-primary" />
          記録
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
              {format(startDate, "yyyy/MM", { locale: ja })} -{" "}
              {format(currentDate, "yyyy/MM", { locale: ja })}
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-fit shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b bg-muted/10">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="p-2 space-y-2">
                <div className="h-8 w-full bg-muted/50 animate-pulse rounded" />
                <div className="h-8 w-full bg-muted/50 animate-pulse rounded" />
                <div className="h-8 w-full bg-muted/50 animate-pulse rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
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
                          {format(toJST(getSafeDate(log.done_at)), "HH:mm")}
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
