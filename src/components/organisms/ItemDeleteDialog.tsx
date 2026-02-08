"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CategoryNode, ItemNode } from "@/services/hadbititems_service";

interface ItemDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ItemNode | null;
  category: CategoryNode | null;
  onConfirm: () => void;
}

export function ItemDeleteDialog({
  isOpen,
  onOpenChange,
  item,
  category,
  onConfirm,
}: ItemDeleteDialogProps) {
  const targetName = item?.name || category?.name || "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>項目の削除</DialogTitle>
          <DialogDescription>
            本当に「{targetName}」を削除しますか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
