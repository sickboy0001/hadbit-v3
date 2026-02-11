"use client";

import React, { useState } from "react";
import { TemplateInputFields } from "@/components/molecules/TemplateInputFields";
import { TemplateInputPreview } from "@/components/molecules/TemplateInputPreview";
import { TemplateField } from "@/components/molecules/SortableFieldTable";

interface Template {
  style: { icon: string; color: string };
  config: { result_format: string };
  fields: TemplateField[];
}

interface TemplateSimulatorProps {
  template: Template;
}

export function TemplateSimulator({ template }: TemplateSimulatorProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleValueChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="border rounded-md p-3 bg-white">
        <div className="text-xs font-bold text-muted-foreground mb-2">入力</div>
        <TemplateInputFields
          fields={template.fields}
          values={values}
          onChange={handleValueChange}
        />
      </div>
      <div className="border rounded-md p-3 bg-slate-50">
        <div className="text-xs font-bold text-muted-foreground mb-2">
          プレビュー
        </div>
        <TemplateInputPreview template={template} values={values} />
      </div>
    </div>
  );
}
