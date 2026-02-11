"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { SimpleCalculator } from "@/components/molecules/SimpleCalculator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface TemplateField {
  name: string;
  label: string;
  width: string;
  type?: string;
  placeholder: string;
  prefix?: string;
  suffix?: string;
}

interface TemplateInputFieldsProps {
  fields: TemplateField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

const getFieldWidthStyle = (width: string, isNumeric: boolean) => {
  let base = 8;
  switch (width) {
    case "small":
      base = 4;
      break;
    case "big":
      base = 12;
      break;
  }
  return { width: `${base + (isNumeric ? 2 : 0)}em` };
};

export function TemplateInputFields({
  fields,
  values,
  onChange,
}: TemplateInputFieldsProps) {
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {fields.map((f) => {
        const isNumeric =
          f.type === "integer" || f.type === "number" || f.type === "real";
        const widthStyle = getFieldWidthStyle(f.width, isNumeric);

        return (
          <div key={f.name} className="inline-flex items-center gap-1">
            {f.prefix && (
              <span className="text-sm text-slate-600">{f.prefix}</span>
            )}
            <div className="relative">
              <Input
                className={`h-8 text-[12px] px-2 ${isNumeric ? "pr-7" : ""}`}
                style={widthStyle}
                placeholder={f.placeholder}
                value={values[f.name] || ""}
                onChange={(e) => onChange(f.name, e.target.value)}
              />
              {isNumeric && (
                <Popover
                  open={activeCalc === f.name}
                  onOpenChange={(open) => setActiveCalc(open ? f.name : null)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600"
                    >
                      <Calculator size={12} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <SimpleCalculator
                      initialValue={values[f.name] || ""}
                      onConfirm={(val) => {
                        onChange(f.name, val);
                      }}
                      onClose={() => setActiveCalc(null)}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {f.suffix && (
              <span className="text-sm text-slate-600">{f.suffix}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
