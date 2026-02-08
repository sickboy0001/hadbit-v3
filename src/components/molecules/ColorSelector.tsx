"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ITEM_COLORS } from "@/constants/hadbititem_const";
import { ChevronDown, ChevronUp } from "lucide-react";
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
    <div className="relative">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">色</Label>
        <div className="flex items-center gap-1">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 p-1 h-8 cursor-pointer"
          />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
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
                      value === c &&
                        "ring-2 ring-primary ring-offset-2 scale-110",
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
        </div>
      </div>
    </div>
  );
}
