"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Code } from "lucide-react";

interface TemplateRawJsonViewCardProps {
  jsonInput: string;
  onJsonChange: (val: string) => void;
}

export function TemplateRawJsonViewCard({
  jsonInput,
  onJsonChange,
}: TemplateRawJsonViewCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="py-3 bg-slate-50 border-b">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <Code size={14} />
          JSON定義
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Textarea
          className="h-full w-full font-mono text-[11px] p-4 resize-none border-none focus-visible:ring-0"
          value={jsonInput}
          onChange={(e) => onJsonChange(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}
