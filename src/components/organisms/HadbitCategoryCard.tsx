"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Pencil,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CategoryNode } from "@/services/hadbititems_service";

interface HadbitCategoryCardProps {
  category: CategoryNode;
  onEdit: (category: CategoryNode) => void;
  onAddItem: (categoryId: number) => void;
  onDelete: (category: CategoryNode) => void;
  children: React.ReactNode;
}

export function HadbitCategoryCard({
  category,
  onEdit,
  onAddItem,
  onDelete,
  children,
}: HadbitCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `cat-${category.id}` });

  const [isExpanded, setIsExpanded] = useState(true);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="overflow-hidden border-none shadow-md bg-card/40 backdrop-blur-sm mb-2"
    >
      <div
        className={cn(
          "flex items-center justify-between p-2 cursor-pointer hover:bg-muted/50 transition-colors group",
          isExpanded && "border-b border-muted/50",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg">{category.name}</span>
            <span className="ml-3 text-xs text-muted-foreground font-mono">
              ID: {category.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onAddItem(category.id);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(category);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
      {isExpanded && (
        <CardContent className="p-0 bg-muted/10">{children}</CardContent>
      )}
    </Card>
  );
}
