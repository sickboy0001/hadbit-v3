"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ITEM_COLORS } from "@/constants/hadbititem_const";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
          {value ? (
            <div
              className="w-4 h-4 rounded-full border border-muted-foreground/20"
              style={{ backgroundColor: value }}
            />
          ) : (
            <Palette className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="flex gap-2 items-center mb-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 h-8 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {ITEM_COLORS?.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "w-6 h-6 rounded-full border border-muted-foreground/20 transition-all hover:scale-110",
                value === c && "ring-2 ring-primary ring-offset-2 scale-110",
              )}
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setIsOpen(false);
              }}
              title={c}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
