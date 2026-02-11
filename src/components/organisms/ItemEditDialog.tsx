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
import { HadbitItemButton } from "@/components/molecules/HadbitItemButton";
import { TemplateEditor, Template } from "./TemplateEditor";

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
    item_style?: string;
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
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [template, setTemplate] = useState<Template | undefined>(undefined);
  const [editorInitialTemplate, setEditorInitialTemplate] = useState<
    Template | undefined
  >(undefined);

  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name || "");
      setShortName(initialValues.shortName || "");
      setDescription(initialValues.description || "");
      setColor(initialValues.color || "");
      setIcon(initialValues.icon || "");

      if (initialValues.item_style) {
        try {
          const parsed = JSON.parse(initialValues.item_style);
          const templateObj =
            parsed && typeof parsed === "object" ? parsed : {};

          // 必須プロパティの補完
          if (!Array.isArray(templateObj.fields)) templateObj.fields = [];
          if (!templateObj.config) templateObj.config = { result_format: "" };
          if (!templateObj.style) templateObj.style = { icon: "", color: "" };

          setTemplate(templateObj);
          setEditorInitialTemplate(templateObj);
          if (templateObj.fields.length > 0) {
            setIsTemplateOpen(true);
          } else {
            setIsTemplateOpen(false);
          }
        } catch (e) {
          console.warn("Failed to parse item_style", e);
          setTemplate(undefined);
          setEditorInitialTemplate(undefined);
          setIsTemplateOpen(false);
        }
      } else {
        setTemplate(undefined);
        setEditorInitialTemplate(undefined);
        setIsTemplateOpen(false);
      }
    }
  }, [isOpen, initialValues]);

  const handleSave = async () => {
    try {
      const currentTemplate: Template = template
        ? { ...template }
        : {
            style: { icon: "", color: "" },
            config: { result_format: "" },
            fields: [],
          };
      currentTemplate.style = { icon: icon, color: color };
      const item_style = JSON.stringify(currentTemplate);

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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          {/* <div>{initialValues?.name || "なし"}</div>{" "}
          <div>{initialValues?.item_style || "なし"}</div>{" "} */}
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 items-start gap-4">
            <div className="flex justify-end pt-2">
              <Label htmlFor="name">名称</Label>
            </div>
            <div className="col-span-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Label htmlFor="short_name">表示名</Label>
            </div>
            <div className="col-span-2">
              <Input
                id="short_name"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Label htmlFor="description">説明</Label>
            </div>
            <div className="col-span-2">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="詳細な説明を入力"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Label>スタイル</Label>
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-4">
                <HadbitItemButton icon={icon} text={shortName} color={color} />
                <ColorSelector value={color} onChange={setColor} />
                <IconSelector value={icon} onChange={setIcon} />
              </div>
            </div>
          </div>

          {(mode === "createItem" || mode === "editItem") && (
            <div className="border rounded-md overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center justify-between p-3 px-4 font-medium hover:bg-muted/50 transition-colors text-sm"
                onClick={() => setIsTemplateOpen(!isTemplateOpen)}
              >
                <span>入力テンプレート設定</span>
                {isTemplateOpen ? (
                  <LucideIcons.ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <LucideIcons.ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {isTemplateOpen && (
                <div className="p-4 border-t bg-slate-50/50">
                  {/* <div>
                    {editorInitialTemplate
                      ? "テンプレートが設定されています"
                      : "テンプレートが設定されていません"}
                  </div> */}
                  <TemplateEditor
                    initialTemplate={editorInitialTemplate}
                    onTemplateChange={setTemplate}
                  />
                </div>
              )}
            </div>
          )}
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
