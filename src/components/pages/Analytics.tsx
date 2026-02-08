"use client";

import { useState, useEffect } from "react";
import { getHadbitItems, CategoryNode } from "@/services/hadbititems_service";
import { LogAnalytics } from "@/components/organisms/LogAnalytics";
import { Loader2 } from "lucide-react";

interface AnalyticsProps {
  userId: string;
}

export default function Analytics({ userId }: AnalyticsProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsData = await getHadbitItems(userId);
        setCategories(itemsData);
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">統計分析</h1>
        <p className="text-muted-foreground mt-1">
          あなたの成長をデータで可視化します。
        </p>
      </header>

      <LogAnalytics userId={userId} categories={categories} />
    </div>
  );
}
