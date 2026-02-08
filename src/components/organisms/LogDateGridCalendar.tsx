"use client";

import { CategoryNode } from "@/services/hadbititems_service";
import { hadbitlog } from "@/services/hadbitlogs_service";
import { LogDateGrid } from "./LogDateGrid";
import { LogCalendar } from "./LogCalendar";

interface LogDateGridCalendarProps {
  userId: string;
  categories: CategoryNode[];
  onLogClick: (log: hadbitlog) => void;
  lastUpdated?: Date;
}

export function LogDateGridCalendar({
  userId,
  categories,
  onLogClick,
  lastUpdated,
}: LogDateGridCalendarProps) {
  return (
    <div className="space-y-8">
      <div>
        <LogDateGrid
          userId={userId}
          categories={categories}
          lastUpdated={lastUpdated}
        />
      </div>
      <div>
        <LogCalendar
          userId={userId}
          categories={categories}
          onLogClick={onLogClick}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}
