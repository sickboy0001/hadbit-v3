import React, { useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TemplateField {
  name: string;
  prefix?: string;
  suffix?: string;
  hide_if_empty?: boolean;
}

interface TemplateInputPreviewProps {
  template: {
    config: { result_format: string };
    fields: TemplateField[];
  };
  values: Record<string, string>;
  onPreviewChange?: (text: string) => void;
}

export function TemplateInputPreview({
  template,
  values,
  onPreviewChange,
}: TemplateInputPreviewProps) {
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

  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(result);
    }
  }, [result, onPreviewChange]);

  return (
    <div className={cn("text-sm text-left")}>
      {result || <span className="text-slate-300 italic">プレビューなし</span>}
    </div>
  );
}
