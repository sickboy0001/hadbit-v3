"use client";

import { useState, useEffect } from "react";
import {
  getHadbitItems,
  CategoryNode,
  ItemNode,
} from "@/services/hadbititems_service";
import {
  getHadbitLogs,
  createHadbitLog,
  deleteHadbitLog,
  updateHadbitLog,
  hadbitlog,
} from "@/services/hadbitlogs_service";
import { toast } from "sonner";
import { LogRegistrar } from "@/components/organisms/LogRegistrar";
import { LogHistory } from "@/components/organisms/LogHistory";
import { LogEditDialog } from "@/components/organisms/LogEditDialog";

interface LogsProps {
  userId: string;
}

export default function Logs({ userId }: LogsProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [logs, setLogs] = useState<hadbitlog[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState<hadbitlog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, logsData] = await Promise.all([
          getHadbitItems(userId),
          getHadbitLogs(userId),
        ]);
        setCategories(itemsData);
        setLogs(logsData);
      } catch (e) {
        console.error("Failed to fetch data", e);
        toast.error("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const openEditDialog = (log: hadbitlog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const addLog = async (item: ItemNode) => {
    // DBに保存する際、タイムゾーン変換による意図しない時間のズレを防ぐため、
    // UTC時刻の文字列表現から 'Z' を除去して送信し、数値をそのまま保存させる。
    const now = new Date().toISOString().replace("Z", "");
    try {
      const res = await createHadbitLog(userId, item.id, now);
      if (res.success && res.data && res.data.length > 0) {
        const newId = res.data[0].id;
        const category = categories.find((c) =>
          c.items.some((i) => i.id === item.id),
        );
        const newLog: hadbitlog = {
          log_id: newId,
          item_id: item.id,
          done_at: now,
          comment: null,
          category_id: category?.id || 0,
          category_name: category?.name || "",
          category_short_name: null,
          master_id: item.id,
          master_name: item.name,
          master_short_name: item.short_name,
        };
        setLogs([newLog, ...logs]);
        toast.success(`${item.name} を記録しました！`, {
          description: new Date().toLocaleTimeString(),
          action: {
            label: "編集",
            onClick: () => openEditDialog(newLog),
          },
        });
      } else {
        toast.error("記録に失敗しました");
      }
    } catch (e) {
      toast.error("エラーが発生しました");
    }
  };

  const deleteLog = async (id: number) => {
    await deleteHadbitLog(userId, id);
    setLogs((prev) => prev.filter((l) => l.log_id !== id));
    toast.info("記録を削除しました。");
  };

  const updateLog = async (
    logId: number,
    doneAt: string,
    comment: string | null,
  ) => {
    await updateHadbitLog(userId, logId, doneAt, comment);
    setLogs((prev) =>
      prev.map((l) =>
        l.log_id === logId ? { ...l, done_at: doneAt, comment: comment } : l,
      ),
    );
    toast.success("記録を更新しました");
  };

  const handleSaveLog = (logId: number, date: string, comment: string) => {
    updateLog(logId, date, comment);
  };

  const handleDeleteLog = (logId: number) => {
    deleteLog(logId);
  };

  return (
    <div className="w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">実績登録</h1>
        <p className="text-muted-foreground italic mt-1">
          今日も一歩ずつ。習慣を積み重ねましょう。
        </p>
      </header>

      <LogRegistrar categories={categories} onAddLog={addLog} />
      <LogHistory logs={logs} onLogClick={openEditDialog} />
      <LogEditDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        log={selectedLog}
        onSave={handleSaveLog}
        onDelete={handleDeleteLog}
      />
    </div>
  );
}
