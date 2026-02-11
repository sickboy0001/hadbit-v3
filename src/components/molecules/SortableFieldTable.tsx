"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TEMPLATE_DUMMEY } from "@/constants/template_dummy_const";
export interface TemplateField {
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

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

const SortableRow = ({ id, children }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    position: isDragging ? "relative" : undefined,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "bg-slate-100 opacity-80" : "hover:bg-slate-50"}
    >
      <TableCell
        className="w-[30px] p-1 text-center cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} className="text-slate-400 mx-auto" />
      </TableCell>
      {children}
    </TableRow>
  );
};

interface SortableFieldTableProps {
  fields: TemplateField[];
  onFieldsChange: (fields: TemplateField[]) => void;
}

export function SortableFieldTable({
  fields,
  onFieldsChange,
}: SortableFieldTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addField = () => {
    const newField: TemplateField = {
      id: Math.random().toString(36).substring(7),
      name: `input${fields.length + 1}`,
      label: "新規項目",
      type: "string",
      width: "normal",
      placeholder: "",
      prefix: "",
      suffix: "",
      hide_if_empty: true,
    };
    onFieldsChange([...fields, newField]);
  };

  const loadTemplate = (key: keyof typeof TEMPLATE_DUMMEY) => {
    const template = TEMPLATE_DUMMEY[key];
    const newFields: TemplateField[] = template.fields.map((f: any) => ({
      id: f.id || Math.random().toString(36).substring(7),
      name: f.name,
      label: f.label,
      type: f.type,
      width: f.width || "normal",
      placeholder: f.placeholder || "",
      prefix: f.prefix || "",
      suffix: f.suffix || "",
      hide_if_empty: f.hide_if_empty !== false,
    }));
    onFieldsChange(newFields);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    onFieldsChange(newFields);
  };

  const updateField = (index: number, key: keyof TemplateField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    onFieldsChange(newFields);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      onFieldsChange(newFields);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-8 w-[30px] px-0"></TableHead>
            <TableHead className="h-8 text-[10px] px-2">Name</TableHead>
            <TableHead className="h-8 text-[10px] px-2">Label</TableHead>
            <TableHead className="h-8 text-[10px] px-2">Placeholder</TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[75px]">
              Width
            </TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[40px]">Pre</TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[70px]">
              Type
            </TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[40px]">Suf</TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[30px] text-center">
              Hide
            </TableHead>
            <TableHead className="h-8 text-[10px] px-1 w-[30px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {fields.map((f, i) => (
              <SortableRow key={f.id || i} id={f.id}>
                <TableCell className="p-1">
                  <Input
                    className="h-9 text-[11px] px-2"
                    value={f.name}
                    onChange={(e) => updateField(i, "name", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    className="h-9 text-[11px] px-2"
                    value={f.label}
                    onChange={(e) => updateField(i, "label", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    className="h-9 text-[11px] px-2"
                    value={f.placeholder || ""}
                    onChange={(e) =>
                      updateField(i, "placeholder", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Select
                    value={f.width || "normal"}
                    onValueChange={(val) => updateField(i, "width", val)}
                  >
                    <SelectTrigger className="h-9 text-sm px-1 w-full py-0">
                      <SelectValue placeholder="Width" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="big">Big</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    className="h-9 text-[11px] px-1 text-center font-mono bg-slate-50"
                    value={f.prefix}
                    onChange={(e) => updateField(i, "prefix", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-1">
                  <Select
                    value={f.type || "string"}
                    onValueChange={(val) => updateField(i, "type", val)}
                  >
                    <SelectTrigger className="h-9 text-sm px-2 w-full leading-none min-h-7">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="integer">Integer</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="real">Real</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-1">
                  <Input
                    className="h-9 text-[11px] px-1 text-center font-mono bg-slate-50"
                    value={f.suffix}
                    onChange={(e) => updateField(i, "suffix", e.target.value)}
                  />
                </TableCell>
                <TableCell className="p-1 text-center">
                  <Checkbox
                    checked={f.hide_if_empty}
                    onCheckedChange={(v) => updateField(i, "hide_if_empty", v)}
                  />
                </TableCell>
                <TableCell className="p-1 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-red-500"
                    onClick={() => removeField(i)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </TableCell>
              </SortableRow>
            ))}
          </SortableContext>
          {fields.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={10}
                className="p-4 text-center bg-slate-50/50"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500">
                    テンプレートから開始
                  </span>
                  <div className="flex gap-2">
                    {(
                      Object.keys(TEMPLATE_DUMMEY) as Array<
                        keyof typeof TEMPLATE_DUMMEY
                      >
                    ).map((key) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(key)}
                        className="text-xs h-7"
                      >
                        {TEMPLATE_DUMMEY[key].name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
          <TableRow>
            <TableCell colSpan={10} className="p-1">
              <Button
                variant="ghost"
                className="w-full h-9 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-dashed border-2 border-blue-400"
                onClick={addField}
              >
                <Plus size={12} className="mr-1" />
                行を追加
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </DndContext>
  );
}
