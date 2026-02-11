"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Play, Eye } from "lucide-react";
import {
  SortableFieldTable,
  TemplateField,
} from "@/components/molecules/SortableFieldTable";
import { LogTemplateDataInput } from "./LogTemplateDataInput";

export interface Template {
  style: { icon: string; color: string };
  config: { result_format: string };
  fields: TemplateField[];
}

interface TemplateEditorProps {
  initialTemplate?: Template;
  onTemplateChange?: (template: Template) => void;
}

const defaultTemplate: Template = {
  style: { icon: "Activity", color: "#000000" },
  config: { result_format: "" },
  fields: [],
};

export function TemplateEditor({
  initialTemplate = defaultTemplate,
  onTemplateChange,
}: TemplateEditorProps) {
  const [template, setTemplate] = useState<Template>(initialTemplate);

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);

  const handleFieldsChange = (newFields: TemplateField[]) => {
    // フィールドの並び順に合わせて result_format を再生成する
    // TemplateTester.tsx / TemplateFieldsCard.tsx と同様のロジック
    const newResultFormat = newFields.map((f) => `{${f.name}}`).join("");

    const newTemplate = {
      ...template,
      fields: newFields,
      config: { ...template.config, result_format: newResultFormat },
    };

    setTemplate(newTemplate);
    onTemplateChange?.(newTemplate);
  };

  return (
    <div className="space-y-6">
      <div className="text-sm items-center gap-2 p-1">
        ■テンプレート編集
        <SortableFieldTable
          fields={template.fields || []}
          onFieldsChange={handleFieldsChange}
        />
      </div>

      <div className="text-sm items-center gap-2 p-1">
        ■動作確認
        <LogTemplateDataInput template={template} />
      </div>
    </div>
  );
}
