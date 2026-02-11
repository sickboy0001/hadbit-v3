"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import {
  TemplateInputFields,
  TemplateField,
} from "@/components/molecules/TemplateInputFields";

interface TemplateDataInputEditorCardProps {
  fields: TemplateField[];
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
}

export function TemplateDataInputEditorCard({
  fields,
  values,
  onValuesChange,
}: TemplateDataInputEditorCardProps) {
  const handleChange = (name: string, value: string) => {
    onValuesChange({ ...values, [name]: value });
  };

  return (
    <Card>
      <CardHeader className="py-3 bg-slate-50 border-b">
        <CardTitle className="text-xs font-bold text-slate-500 flex items-center gap-2">
          <Pencil size={14} className="text-slate-600" />
          データ入力
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4 overflow-auto max-h-[250px]">
        <TemplateInputFields
          fields={fields}
          values={values}
          onChange={handleChange}
        />
      </CardContent>
    </Card>
  );
}
