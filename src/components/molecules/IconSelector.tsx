"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ITEM_ICONS } from "@/constants/hadbititem_const";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface IconSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">アイコン</Label>
        <div className="flex items-center gap-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 h-8 text-xs"
            placeholder="Icon name"
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
            {/* PopoverContentの修正 */}
            <PopoverContent
              className="p-0 border-none shadow-none" // 枠線を一旦消して内側で制御
              align="start"
              side="bottom"
              sideOffset={5}
            >
              <div className="w-[320px] bg-popover text-popover-foreground border rounded-md shadow-md p-3">
                <div className="grid grid-cols-10 gap-1">
                  {ITEM_ICONS?.map((iconName) => {
                    const Icon = (LucideIcons as any)[iconName];
                    return (
                      <Button
                        key={iconName}
                        type="button"
                        variant={value === iconName ? "default" : "outline"}
                        // size="icon" を削除、または以下のように記述
                        size={undefined}
                        onClick={() => {
                          onChange(iconName);
                          setIsOpen(false);
                        }}
                        // w-7 h-7 を直接指定し、flex-none でサイズを固定
                        className="h-7 w-7 min-w-7 p-0 flex items-center justify-center"
                      >
                        {Icon ? (
                          <Icon className="h-4 w-4" /> // アイコン自体のサイズ
                        ) : (
                          <span className="text-[8px]">?</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </PopoverContent>{" "}
          </Popover>
        </div>
      </div>
    </div>
  );
}
