"use client";

import { useState, useRef } from "react";
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
  const [isClicked, setIsClicked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const Icon = icon ? (LucideIcons as any)[icon] : null;

  const handleClick = (e: React.MouseEvent) => {
    // 既存のタイマーがあればクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsClicked(true);
    if (onClick) {
      onClick();
    }

    // 1秒後に状態を戻す
    timeoutRef.current = setTimeout(() => {
      setIsClicked(false);
      timeoutRef.current = null;
    }, 1000);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "gap-0 transition-all duration-300",
        isClicked && "scale-110 shadow-lg",
        className,
      )}
      style={{
        color: isClicked ? "#fff" : color || undefined,
        backgroundColor: isClicked ? color || "#000" : "transparent",
        borderColor: color || undefined,
      }}
      onClick={handleClick}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {text}
    </Button>
  );
}
