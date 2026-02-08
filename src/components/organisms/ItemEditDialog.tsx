"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategoryAction,
  createItemAction,
  updateCategoryAction,
  updateItemAction,
} from "@/services/hadbititems_service";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { IconSelector } from "@/components/molecules/IconSelector";
import { ColorSelector } from "@/components/molecules/ColorSelector";

export type ItemEditMode =
  | "createCategory"
  | "editCategory"
  | "createItem"
  | "editItem";

interface ItemEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ItemEditMode;
  userId: string;
  categoryId?: number | null;
  editingId?: number;
  initialValues: {
    name: string;
    shortName: string;
    description: string;
    color: string;
    icon: string;
  };
  onSuccess: (data: any) => void;
}

export function ItemEditDialog({
  isOpen,
  onOpenChange,
  mode,
  userId,
  categoryId,
  editingId,
  initialValues,
  onSuccess,
}: ItemEditDialogProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("");
  const [icon, setIcon] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name || "");
      setShortName(initialValues.shortName || "");
      setDescription(initialValues.description || "");
      setColor(initialValues.color || "");
      setIcon(initialValues.icon || "");
    }
  }, [isOpen, initialValues]);

  const handleSave = async () => {
    try {
      // item_style:{"style":{"icon":"ChartPie","color":"#008B02"}}
      const item_style = JSON.stringify({
        style: { icon: icon, color: color },
      });

      let res;
      if (mode === "createCategory") {
        res = await createCategoryAction(
          userId,
          name,
          shortName,
          description,
          item_style,
        );
      } else if (mode === "createItem" && categoryId) {
        res = await createItemAction(
          userId,
          categoryId,
          name,
          shortName,
          description,
          item_style,
        );
      } else if (mode === "editCategory" && editingId) {
        await updateCategoryAction(
          editingId,
          name,
          shortName,
          description,
          item_style,
        );
        res = {
          success: true,
          data: {
            id: editingId,
            name,
            short_name: shortName,
            description,
            color,
            icon,
            item_style,
          },
        };
      } else if (mode === "editItem" && editingId) {
        await updateItemAction(
          editingId,
          name,
          shortName,
          description,
          item_style,
        );
        res = {
          success: true,
          data: {
            id: editingId,
            name,
            short_name: shortName,
            description,
            color,
            icon,
            item_style,
          },
        };
      }

      if (res && res.success) {
        onSuccess(res.data);
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("保存に失敗しました");
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "createCategory":
        return "新規カテゴリ作成";
      case "editCategory":
        return "カテゴリ編集";
      case "createItem":
        return "新規項目作成";
      case "editItem":
        return "項目編集";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "createCategory":
      case "editCategory":
        return "カテゴリの名称を変更します。";
      case "createItem":
      case "editItem":
        return "項目の詳細を編集します。";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              名称
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="short_name" className="text-right">
              表示名
            </Label>
            <Input
              id="short_name"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              説明
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="詳細な説明を入力"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-3">スタイル</Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-3 items-start">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  style={{ color: color, borderColor: color }}
                >
                  {(() => {
                    const Icon = (LucideIcons as any)[icon];
                    return Icon ? <Icon className="h-4 w-4" /> : null;
                  })()}
                  {shortName}
                </Button>

                <div className="flex flex-wrap items-center gap-4">
                  <ColorSelector value={color} onChange={setColor} />
                  <IconSelector value={icon} onChange={setIcon} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
