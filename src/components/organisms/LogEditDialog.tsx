import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { format, add } from "date-fns";
import { getHadbitItem, ItemNode } from "@/services/hadbititems_service";
import { LogTemplateDataInput } from "@/components/organisms/LogTemplateDataInput";
import { Template } from "@/components/organisms/TemplateEditor";
import { DateTimePicker } from "@/components/molecules/DateTimePicker";
import { getSafeDate, toJST } from "@/lib/date-utils";

interface LogEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: hadbitlog | null;
  onSave: (
    logId: number,
    date: string,
    comment: string | null,
    details?: string,
  ) => void;
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
  const [editDetails, setEditDetails] = useState<Record<string, string>>({});
  const [item, setItem] = useState<ItemNode | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loadingItem, setLoadingItem] = useState(false);

  useEffect(() => {
    if (log && isOpen) {
      // UTCとして解釈するために、末尾にZがない場合は付与する
      const date = toJST(getSafeDate(log.done_at));
      // datetime-local用にフォーマット (yyyy-MM-ddThh:mm)
      setEditDate(format(date, "yyyy-MM-dd'T'HH:mm"));
      setEditComment(log.comment || "");
      setTemplate(null);
      setEditDetails({});

      // detailsのパース (log型定義にdetailsがない場合に備えてanyキャスト)
      const logDetails = (log as any).details;
      if (logDetails) {
        try {
          const parsed =
            typeof logDetails === "string"
              ? JSON.parse(logDetails)
              : logDetails;
          setEditDetails(parsed || {});
        } catch (e) {}
      }

      const fetchItem = async () => {
        setLoadingItem(true);
        try {
          const fetchedItem = await getHadbitItem(log.item_id);
          setItem(fetchedItem);
          if (fetchedItem?.item_style) {
            try {
              const parsed =
                typeof fetchedItem.item_style === "string"
                  ? JSON.parse(fetchedItem.item_style)
                  : fetchedItem.item_style;
              if (parsed?.fields?.length > 0) {
                setTemplate(parsed);
              }
            } catch (e) {
              console.warn("Failed to parse item_style", e);
            }
          }
        } catch (error) {
          console.error("Failed to fetch item details", error);
          setItem(null);
        } finally {
          setLoadingItem(false);
        }
      };
      fetchItem();
    } else {
      setItem(null);
      setTemplate(null);
      setEditDetails({});
    }
  }, [log, isOpen]);

  const handleSave = () => {
    if (log) {
      const date = new Date(editDate);
      const detailsJson = JSON.stringify(editDetails);
      // DB保存用に Z を除去して UTC 数値をそのまま送る
      onSave(
        log.log_id,
        date.toISOString().replace("Z", ""),
        editComment,
        detailsJson,
      );
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
          <DateTimePicker
            id="date"
            label="日時"
            value={editDate}
            onChange={setEditDate}
          />
          <div className="grid gap-2">
            <Label htmlFor="comment">コメント</Label>
            {loadingItem && (
              <div className="space-y-2 py-1 ">
                <div className="h-8 w-full bg-muted/50 animate-pulse rounded" />
                <div className="h-8 w-3/4 bg-muted/50 animate-pulse rounded" />
              </div>
            )}
            {/* テンプレート入力 */}
            {!loadingItem && template && (
              <LogTemplateDataInput
                template={template}
                initialValues={editDetails}
                onPreviewChange={setEditComment}
                onValuesChange={setEditDetails}
                noPreview={true}
              />
            )}
            {/* コメント入力 */}
            <Textarea
              id="comment"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder={
                template ? "テンプレートから自動生成" : "メモを残せます"
              }
              className="text-lg"
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
