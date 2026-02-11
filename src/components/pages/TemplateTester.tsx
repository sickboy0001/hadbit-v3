"use client";
import React, { useState } from "react";
import { TemplateEditor } from "../organisms/TemplateEditor";
import { LogTemplateDatainpuTester } from "../organisms/LogTemplateDatainpuTester";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialTemplate = {
  style: { icon: "Run", color: "#3B82F6" },
  config: { result_format: "{distance}{duration}\n{location}{memo}" },
  fields: [
    {
      id: "f_dist",
      name: "distance",
      label: "距離",
      type: "number",
      width: "small",
      placeholder: "0.0",
      prefix: "",
      suffix: "Km",
      hide_if_empty: true,
    },
    {
      id: "f_dur",
      name: "duration",
      label: "時間",
      type: "number",
      width: "small",
      placeholder: "分",
      prefix: "[",
      suffix: "分]",
      hide_if_empty: true,
    },
    {
      id: "f_loc",
      name: "location",
      label: "場所",
      type: "string",
      width: "normal",
      placeholder: "コース名",
      prefix: "[",
      suffix: "]",
      hide_if_empty: true,
    },
    {
      id: "f_memo",
      name: "memo",
      label: "メモ",
      type: "text",
      width: "big",
      placeholder: "体調など",
      prefix: "memo:",
      suffix: "",
      hide_if_empty: true,
    },
  ],
};

interface Props {
  userId: string;
}

export default function TemplateSandboxV2({ userId }: Props) {
  const [template, setTemplate] = useState(initialTemplate);

  // StateからJSON入力へ（GUI操作時）
  const updateTemplate = (newTemplate: typeof template) => {
    setTemplate(newTemplate);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-100 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>TemplateEditor</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateEditor
            initialTemplate={template}
            onTemplateChange={updateTemplate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LogTemplateDatainpuTester</CardTitle>
        </CardHeader>
        <CardContent>
          <LogTemplateDatainpuTester userId={userId} />
        </CardContent>
      </Card>

      {/* <div className="grid grid-cols-2 gap-4 h-[500px]">
        <div className="flex flex-col gap-4">
          <TemplateFieldsCard
            template={template}
            onTemplateChange={updateTemplate}
          />
          <TemplateDataInputEditorCard
            fields={template.fields}
            values={values}
            onValuesChange={setValues}
          />
          <TemplateDataResultCard template={template} values={values} />
        </div>
        <div className="flex flex-col gap-4">
          <TemplateRawJsonViewCard
            jsonInput={jsonInput}
            onJsonChange={handleJsonChange}
          />

          <TemplateFieldsListCard fields={template.fields} />
        </div>
      </div> */}
    </div>
  );
}
