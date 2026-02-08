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
import { ITEM_COLORS, ITEM_ICONS } from "@/constants/hadbititem_const";
import { cn } from "@/lib/utils";
import {
  createCategoryAction,
  createItemAction,
  updateCategoryAction,
  updateItemAction,
} from "@/services/hadbititems_service";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";

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
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconOpen, setIsIconOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name || "");
      setShortName(initialValues.shortName || "");
      setDescription(initialValues.description || "");
      setColor(initialValues.color || "");
      setIcon(initialValues.icon || "");
      setIsColorOpen(false);
      setIsIconOpen(false);
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
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="color"
                      className="text-xs text-muted-foreground"
                    >
                      色
                    </Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 p-1 h-8 cursor-pointer"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsColorOpen(!isColorOpen)}
                      >
                        {isColorOpen ? (
                          <LucideIcons.ChevronUp className="h-4 w-4" />
                        ) : (
                          <LucideIcons.ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="icon"
                      className="text-xs text-muted-foreground"
                    >
                      アイコン
                    </Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-24 h-8 text-xs"
                        placeholder="Icon name"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsIconOpen(!isIconOpen)}
                      >
                        {isIconOpen ? (
                          <LucideIcons.ChevronUp className="h-4 w-4" />
                        ) : (
                          <LucideIcons.ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {isColorOpen && (
                <div className="mt-2 p-2 border rounded-md bg-muted/20 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex gap-2 items-center mb-2">
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ITEM_COLORS?.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cn(
                          "w-6 h-6 rounded-full border border-muted-foreground/20 transition-all hover:scale-110",
                          color === c &&
                            "ring-2 ring-primary ring-offset-2 scale-110",
                        )}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {isIconOpen && (
                <div className="mt-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-muted/20 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex flex-wrap gap-2">
                    {ITEM_ICONS?.map((iconName) => {
                      const Icon = (LucideIcons as any)[iconName];
                      return (
                        <Button
                          key={iconName}
                          type="button"
                          variant={icon === iconName ? "default" : "outline"}
                          size="xs"
                          onClick={() => {
                            setIcon(iconName);
                            setIsIconOpen(false);
                          }}
                          className="h-8 w-8 p-0"
                          title={iconName}
                        >
                          {Icon ? <Icon className="h-4 w-4" /> : iconName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
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
