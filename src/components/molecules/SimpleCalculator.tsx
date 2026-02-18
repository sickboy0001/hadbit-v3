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
    <div className="w-60 p-2">
      <div className="mb-2 flex items-center gap-1">
        <div className="flex-1 bg-slate-100 px-2 py-1 text-right text-lg font-mono rounded h-10 overflow-hidden flex items-center justify-end">
          {display}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {["7", "8", "9"].map((k) => (
          <Button
            key={k}
            variant="outline"
            size="sm"
            className="h-10 p-0 text-lg"
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
            className="h-10 p-0 text-lg"
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
            className="h-10 p-0 text-lg"
            onClick={() => handlePush(k)}
          >
            {k}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="h-10 p-0 text-red-500 text-lg"
          onClick={handleClear}
        >
          C
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 p-0 text-lg"
          onClick={() => handlePush("0")}
        >
          0
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-10 p-0 text-lg"
          onClick={() => handlePush(".")}
        >
          .
        </Button>
      </div>
    </div>
  );
};
