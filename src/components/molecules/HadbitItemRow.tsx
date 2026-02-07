"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemNode } from "@/services/hadbititems_service";

interface HadbitItemRowProps {
  item: ItemNode;
  onEdit: (item: ItemNode) => void;
  onDelete: (item: ItemNode) => void;
}

export function HadbitItemRow({ item, onEdit, onDelete }: HadbitItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `item-${item.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between py-0.5 px-1.5 pl-6 hover:bg-muted/50 group transition-all bg-transparent"
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing p-1 touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <div className="font-medium">{item.name}</div>
          {item.short_name && (
            <div className="text-xs text-muted-foreground">
              {item.short_name}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
