"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import { TemplateInputPreview } from "../molecules/TemplateInputPreview";

interface TemplateField {
  name: string;
  prefix?: string;
  suffix?: string;
  hide_if_empty?: boolean;
}

interface TemplateDataResultCardProps {
  template: {
    config: { result_format: string };
    fields: TemplateField[];
  };
  values: Record<string, string>;
}

export function TemplateDataResultCard({
  template,
  values,
}: TemplateDataResultCardProps) {
  const result = useMemo(() => {
    if (!template?.config?.result_format) return "";
    let resultStr = template.config.result_format;
    template.fields.forEach((field) => {
      const val = values[field.name];
      const rendered =
        val && val.trim() !== ""
          ? `${field.prefix || ""}${val}${field.suffix || ""}`
          : field.hide_if_empty
            ? ""
            : `${field.prefix || ""}${field.suffix || ""}`;
      resultStr = resultStr.split(`{${field.name}}`).join(rendered);
    });
    return resultStr
      .split("\n")
      .filter((l) => l.trim() !== "")
      .join("\n");
  }, [template, values]);

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="py-3 bg-blue-50 border-b">
        <CardTitle className="text-xs font-bold text-blue-600 flex items-center gap-2">
          <Eye size={14} />
          プレビュー
        </CardTitle>
      </CardHeader>
      {/* <div>{template.fields.map((f) => f.name).join(", ")}</div>
      <div>{template.config.result_format}</div> */}
      <CardContent className="h-full flex p-6">
        <TemplateInputPreview template={template} values={values} />
      </CardContent>
    </Card>
  );
}
