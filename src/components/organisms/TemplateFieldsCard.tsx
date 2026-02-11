"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter } from "lucide-react";
import {
  SortableFieldTable,
  TemplateField,
} from "@/components/molecules/SortableFieldTable";

interface Template {
  style: { icon: string; color: string };
  config: { result_format: string };
  fields: TemplateField[];
}

interface TemplateFieldsCardProps {
  template: Template;
  onTemplateChange: (newTemplate: Template) => void;
}

export function TemplateFieldsCard({
  template,
  onTemplateChange,
}: TemplateFieldsCardProps) {
  const handleFieldsChange = (newFields: TemplateField[]) => {
    // フィールドの並び順に合わせて result_format を再生成する
    const newResultFormat = newFields.map((f) => `{${f.name}}`).join("");
    onTemplateChange({
      ...template,
      fields: newFields,
      config: { ...template.config, result_format: newResultFormat },
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="py-3 bg-slate-50 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <ListFilter size={14} />
          GUI編集
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <SortableFieldTable
          fields={template.fields}
          onFieldsChange={handleFieldsChange}
        />
      </CardContent>
    </Card>
  );
}
