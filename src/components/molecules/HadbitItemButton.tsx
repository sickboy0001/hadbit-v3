"use client";

import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface HadbitItemButtonProps {
  icon?: string;
  text: string;
  color?: string;
  onClick?: () => void;
  className?: string;
}

export function HadbitItemButton({
  icon,
  text,
  color,
  onClick,
  className,
}: HadbitItemButtonProps) {
  const Icon = icon ? (LucideIcons as any)[icon] : null;

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("gap-0", className)}
      style={{
        color: color || undefined,
        borderColor: color || undefined,
      }}
      onClick={onClick}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {text}
    </Button>
  );
}
