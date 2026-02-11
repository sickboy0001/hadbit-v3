"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { add, format } from "date-fns";

interface DateTimePickerProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DateTimePicker({
  id,
  label,
  value,
  onChange,
}: DateTimePickerProps) {
  const adjustDate = (amount: number, unit: "hours" | "days") => {
    if (!value) return;
    const current = new Date(value);
    const newDate = add(current, { [unit]: amount });
    onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="grid grid-cols-6 gap-1">
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(-1, "days")}
          title="1日前"
        >
          -1d
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(-12, "hours")}
          title="12時間前"
        >
          -12h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(-1, "hours")}
          title="1時間前"
        >
          -1h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(1, "hours")}
          title="1時間後"
        >
          +1h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(12, "hours")}
          title="12時間後"
        >
          +12h
        </Button>
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={() => adjustDate(1, "days")}
          title="1日後"
        >
          +1d
        </Button>
      </div>
    </div>
  );
}
