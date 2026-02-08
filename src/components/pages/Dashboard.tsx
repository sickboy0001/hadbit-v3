import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Settings,
  PieChart,
  ArrowUpRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import {
  getCurrentStreak,
  getDailyActivityCounts,
  getTopActivities,
  getRecentActivities,
} from "@/services/hadbitdashboard_service";
import { getHadbitItems } from "@/services/hadbititems_service";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

interface DashboardProps {
  userId: string;
}
export default async function Dashboard({ userId }: DashboardProps) {
  const [currentStreak, dailyActivityCounts, topActivities, recentActivities] =
    await Promise.all([
      getCurrentStreak(userId),
      getDailyActivityCounts(userId),
      getTopActivities(userId),
      getRecentActivities(userId),
    ]);

  // JSTでの今日の日付文字列を作成 (yyyy-MM-dd)
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  const todayStr = `${y}-${m}-${d}`;

  const todayData = dailyActivityCounts.find((d) => d.active_date === todayStr);
  const todayCount = todayData ? Number(todayData.activity_count) : 0;

  // 昨日との差分計算
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const partsY = formatter.formatToParts(yesterday);
  const yY = partsY.find((p) => p.type === "year")?.value;
  const mY = partsY.find((p) => p.type === "month")?.value;
  const dY = partsY.find((p) => p.type === "day")?.value;
  const yesterdayStr = `${yY}-${mY}-${dY}`;

  const yesterdayData = dailyActivityCounts.find(
    (d) => d.active_date === yesterdayStr,
  );
  const yesterdayCount = yesterdayData
    ? Number(yesterdayData.activity_count)
    : 0;
  const diff = todayCount - yesterdayCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          今日の習慣化の状況を確認しましょう。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/hadbit/logs">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 bg-card hover:border-primary hover:text-primary transition-all group"
          >
            <ClipboardList className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span>実績登録</span>
          </Button>
        </Link>
        <Link href="/hadbit/analytics">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 bg-card hover:border-primary hover:text-primary transition-all group"
          >
            <PieChart className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span>分析表示</span>
          </Button>
        </Link>
        <Link href="/hadbit/items">
          <Button
            variant="outline"
            className="w-full h-24 flex flex-col gap-2 bg-card hover:border-primary hover:text-primary transition-all group"
          >
            <Settings className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span>項目管理</span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/hadbit/logs">
          <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                今日の完了項目
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                昨日より {diff > 0 ? "+" : ""}
                {diff}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              現在の継続日数
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold">{currentStreak} 日</div>
            <p className="text-xs text-muted-foreground mt-1">
              過去最高記録を更新中！
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              活動率上位(最近7日間)
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topActivities.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium">{item.master_name}</span>
                  <span className="font-bold">{item.activity_count} 回</span>
                </div>
              ))}
              {topActivities.length === 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  データなし
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 transition-all hover:bg-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              最近の活動(最近7日間)
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.slice(0, 5).map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="font-medium">{log.master_name}</span>
                  <span className="text-muted-foreground text-[10px]">
                    {formatDistanceToNow(new Date(log.done_at), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-xs text-muted-foreground text-center">
                  データなし
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
