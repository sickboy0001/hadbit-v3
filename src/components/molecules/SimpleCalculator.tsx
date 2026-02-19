"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SimpleCalculatorProps {
  initialValue: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

export const SimpleCalculator = ({
  initialValue,
  onConfirm,
  onClose,
}: SimpleCalculatorProps) => {
  const [display, setDisplay] = useState(initialValue || "");

  const handlePush = (val: string) => {
    const newValue = display + val;
    setDisplay(newValue);
    onConfirm(newValue);
  };

  const handleClear = () => {
    const newValue = "";
    setDisplay(newValue);
    onConfirm(newValue);
  };

  return (
    <div className="w-72 p-2 sm:w-60">
      <div className="mb-2 flex items-center gap-1">
        <div className="flex-1 bg-slate-100 px-2 py-1 text-right text-[22px] font-mono rounded h-12 overflow-hidden flex items-center justify-end sm:h-10 sm:text-lg">
          {display}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 sm:h-10 sm:w-10"
          onClick={onClose}
        >
          <X className="h-[22px] w-[22px] sm:h-[18px] sm:w-[18px]" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["7", "8", "9"].map((k) => (
          <Button
            key={k}
            variant="outline"
            size="sm"
            className="h-12 p-0 text-[22px] sm:h-10 sm:text-lg"
            onClick={() => handlePush(k)}
          >
            {k}
          </Button>
        ))}
        {["4", "5", "6"].map((k) => (
          <Button
            key={k}
            variant="outline"
            size="sm"
            className="h-12 p-0 text-[22px] sm:h-10 sm:text-lg"
            onClick={() => handlePush(k)}
          >
            {k}
          </Button>
        ))}
        {["1", "2", "3"].map((k) => (
          <Button
            key={k}
            variant="outline"
            size="sm"
            className="h-12 p-0 text-[22px] sm:h-10 sm:text-lg"
            onClick={() => handlePush(k)}
          >
            {k}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="h-12 p-0 text-red-500 text-[22px] sm:h-10 sm:text-lg"
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-12 p-0 text-[22px] sm:h-10 sm:text-lg"
          onClick={() => handlePush("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-12 p-0 text-[22px] sm:h-10 sm:text-lg"
          onClick={() => handlePush(".")}
        >
          .
        </Button>
      </div>
    </div>
  );
};
