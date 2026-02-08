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
import { format, add } from "date-fns";
import { getSafeDate, toJST } from "@/lib/date-utils";

interface LogEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: hadbitlog | null;
  onSave: (logId: number, date: string, comment: string) => void;
  onDelete: (logId: number) => void;
}

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
      const date = toJST(getSafeDate(log.done_at));
      // datetime-local用にフォーマット (yyyy-MM-ddThh:mm)
      setEditDate(format(date, "yyyy-MM-dd'T'HH:mm"));
      setEditComment(log.comment || "");
    }
  }, [log, isOpen]);

  const handleSave = () => {
    if (log) {
      const date = new Date(editDate);
      // DB保存用に Z を除去して UTC 数値をそのまま送る
      onSave(log.log_id, date.toISOString().replace("Z", ""), editComment);
      onOpenChange(false);
    }
  };

  const adjustDate = (amount: number, unit: "hours" | "days") => {
    if (!editDate) return;
    const current = new Date(editDate);
    const newDate = add(current, { [unit]: amount });
    setEditDate(format(newDate, "yyyy-MM-dd'T'HH:mm"));
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
            <div className="grid grid-cols-6 gap-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(-1, "days")}
                title="1日前"
              >
                -1d
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(-12, "hours")}
                title="12時間前"
              >
                -12h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(-1, "hours")}
                title="1時間前"
              >
                -1h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(1, "hours")}
                title="1時間後"
              >
                +1h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(12, "hours")}
                title="12時間後"
              >
                +12h
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => adjustDate(1, "days")}
                title="1日後"
              >
                +1d
              </Button>
            </div>
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
