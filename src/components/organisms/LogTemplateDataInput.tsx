"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TemplateInputFields } from "@/components/molecules/TemplateInputFields";
import { TemplateField } from "@/components/molecules/SortableFieldTable";

interface Template {
  style: { icon: string; color: string };
  config: { result_format: string };
  fields: TemplateField[];
}

interface LogTemplateDataInputProps {
  template: Template;
  initialValues?: Record<string, string>;
  onPreviewChange?: (text: string) => void;
  onValuesChange?: (values: Record<string, string>) => void;
  noPreview?: boolean;
}

export function LogTemplateDataInput({
  template,
  initialValues = {},
  onPreviewChange,
  onValuesChange,
  noPreview = false,
}: LogTemplateDataInputProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      // 親から渡された初期値があれば反映（ループ防止のためJSON比較などを推奨するが、ここでは簡易的にセット）
      setValues(initialValues);
    }
  }, [initialValues]);

  useEffect(() => {
    onValuesChange?.(values);
  }, [values, onValuesChange]);

  const previewText = useMemo(() => {
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
    onPreviewChange?.(previewText);
  }, [previewText, onPreviewChange]);

  const handleValueChange = (name: string, value: string) => {
    setValues((prev) => {
      const newValues = { ...prev, [name]: value };
      return newValues;
    });
  };

  return (
    <div className="flex flex-col gap-1 mt-2">
      {/* <div className="text-xs font-bold text-muted-foreground "></div> */}
      <TemplateInputFields
        fields={template.fields}
        values={values}
        onChange={handleValueChange}
      />
      {!noPreview && (
        <div>
          <div className="text-xs font-bold text-muted-foreground mb-2">
            プレビュー
          </div>
          <div className="text-sm text-left">
            {previewText || (
              <span className="text-slate-300 italic">プレビューなし</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
