"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Play, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SortableFieldTable,
  TemplateField,
} from "@/components/molecules/SortableFieldTable";
import { LogTemplateDataInput } from "./LogTemplateDataInput";
import TemplateDetailItemSelect from "./TemplateDetailItemSelect";
import {
  createHadbitLog,
  updateHadbitLog,
} from "@/services/hadbitlogs_service";
import { toast } from "sonner";

export interface Template {
  style: { icon: string; color: string };
  config: { result_format: string };
  fields: TemplateField[];
}

interface LogTemplateDatainpuTester {
  initialTemplate?: Template;
  onTemplateChange?: (template: Template) => void;
}

const defaultTemplate: Template = {
  style: { icon: "Activity", color: "#000000" },
  config: { result_format: "" },
  fields: [],
};
interface Props {
  userId: string;
}

export function LogTemplateDatainpuTester({ userId }: Props) {
  const [template, setTemplate] = useState<Template>(defaultTemplate);
  const [previewText, setPreviewText] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleSaveLog = async () => {
    if (!selectedItem) {
      toast.error("アイテムが選択されていません");
      return;
    }
    const now = new Date().toISOString().replace("Z", "");
    try {
      const res = await createHadbitLog(userId, selectedItem.id, now);
      if (res.success && res.data && res.data.length > 0) {
        const logId = res.data[0].id;
        const detailJson = JSON.stringify(values);
        // updateHadbitLogにdetail引数(第5引数)としてvaluesを渡す
        // @ts-ignore: updateHadbitLogの定義がdetailに対応していない場合の回避
        await updateHadbitLog(userId, logId, now, previewText, detailJson);
        toast.success("ログを保存しました");
      } else {
        toast.error("ログの作成に失敗しました");
      }
    } catch (e) {
      console.error(e);
      toast.error("エラーが発生しました");
    }
  };

  return (
    <div className="space-y-6">
      <TemplateDetailItemSelect
        userId={userId}
        onTemplateSelect={(t) => setTemplate(t)}
        onItemSelect={(item) => setSelectedItem(item)}
      />
      <LogTemplateDataInput
        template={template}
        onPreviewChange={setPreviewText}
        onValuesChange={setValues}
      />
      <Card>
        <CardHeader>
          <CardTitle>Result Text (Parent)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-100 rounded-md whitespace-pre-wrap font-mono text-sm">
            {previewText || "(No content)"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Input Values (Parent)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-slate-100 rounded-md whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(values, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveLog} className="gap-2">
          <Save className="h-4 w-4" />
          ログを保存 (Detail含む)
        </Button>
      </div>
    </div>
  );
}
