import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { hadbitlog } from "@/services/hadbitlogs_service";

interface LogEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: hadbitlog | null;
  onSave: (logId: number, date: string, comment: string) => void;
  onDelete: (logId: number) => void;
}

const getSafeDateStr = (dateVal: string | Date) => {
  if (typeof dateVal === "string") {
    return dateVal.endsWith("Z") ? dateVal : `${dateVal}Z`;
  }
  // Dateオブジェクトの場合、DBのUTC値がローカル時間として解釈されている可能性があるため
  // 各コンポーネント(年、月、日、時...)をそのままUTCとして扱うように再構築する
  const d = new Date(dateVal);
  return new Date(
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
    ),
  ).toISOString();
};

export function LogEditDialog({
  isOpen,
  onOpenChange,
  log,
  onSave,
  onDelete,
}: LogEditDialogProps) {
  const [editDate, setEditDate] = useState("");
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    if (log) {
      // UTCとして解釈するために、末尾にZがない場合は付与する
      const dateStr = getSafeDateStr(log.done_at);
      const date = new Date(dateStr);
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
      setEditDate(localISOTime);
      setEditComment(log.comment || "");
    }
  }, [log, isOpen]);

  const handleSave = () => {
    if (log) {
      const date = new Date(editDate);
      onSave(log.log_id, date.toISOString(), editComment);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (log) {
      onDelete(log.log_id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>記録の編集</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>項目名</Label>
            <div className="font-bold text-lg">{log?.master_name}</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">日時</Label>
            <Input
              id="date"
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">コメント</Label>
            <Textarea
              id="comment"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="メモを残せます"
            />
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            削除
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
