"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITEM_ICONS } from "@/constants/hadbititem_const";
import * as LucideIcons from "lucide-react";
import { Smile } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
          {SelectedIcon ? (
            <SelectedIcon className="h-4 w-4" />
          ) : (
            <Smile className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-3" align="start">
        <div className="flex gap-2 items-center mb-3">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="アイコンを検索..."
            className="flex-1 h-8 text-xs"
          />
        </div>
        <div className="h-[300px] overflow-y-auto">
          {/* style属性で10列を強制 */}
          <div
            className="grid gap-1 justify-items-center"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
            }}
          >
            {ITEM_ICONS?.map((iconName) => {
              const Icon = (LucideIcons as any)[iconName];
              if (!Icon) return null;
              return (
                <Button
                  key={iconName}
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 p-0", // p-0で余白をリセット
                    value === iconName && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
