"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Table as TableIcon } from "lucide-react";

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: string;
  width: string;
  placeholder: string;
  prefix: string;
  suffix: string;
  hide_if_empty: boolean;
}

interface TemplateFieldsListCardProps {
  fields: TemplateField[];
}

export function TemplateFieldsListCard({
  fields,
}: TemplateFieldsListCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="py-3 bg-slate-50 border-b">
        <CardTitle className="text-xs font-bold flex items-center gap-2">
          <TableIcon size={14} className="text-slate-600" />
          Fields Table
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-[10px] w-[80px]">Name</TableHead>
              <TableHead className="h-8 text-[10px]">Label</TableHead>
              <TableHead className="h-8 text-[10px]">Width</TableHead>
              <TableHead className="h-8 text-[10px]">Prefix</TableHead>
              <TableHead className="h-8 text-[10px]">Suffix</TableHead>
              <TableHead className="h-8 text-[10px] text-center w-[50px]">
                Hide
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((f, i) => (
              <TableRow key={i} className="h-8 hover:bg-slate-50">
                <TableCell className="py-1 text-[10px] font-medium">
                  {f.name}
                </TableCell>
                <TableCell className="py-1 text-[10px]">{f.label}</TableCell>
                <TableCell className="py-1 text-[10px] text-slate-500">
                  {f.width || "normal"}
                </TableCell>
                <TableCell className="py-1 text-[10px] font-mono text-slate-500">
                  {f.prefix}
                </TableCell>
                <TableCell className="py-1 text-[10px] font-mono text-slate-500">
                  {f.suffix}
                </TableCell>
                <TableCell className="py-1 text-[10px] text-center">
                  {f.hide_if_empty ? "Yes" : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
