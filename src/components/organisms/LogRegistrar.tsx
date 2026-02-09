"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CategoryNode,
  ItemNode,
  getHadbitItems,
} from "@/services/hadbititems_service";
import { HadbitItemButton } from "@/components/molecules/HadbitItemButton";

interface LogRegistrarProps {
  userId: string;
  onAddLog: (item: ItemNode) => void;
}

export function LogRegistrar({ userId, onAddLog }: LogRegistrarProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await getHadbitItems(userId);
        setCategories(data);
      } catch (e) {
        console.error("Failed to fetch items for LogRegistrar", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-fit shadow-sm">
            <CardHeader className="p-3">
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-3 pt-0">
              <div className="h-8 w-20 bg-muted/50 animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted/50 animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted/50 animate-pulse rounded" />
              <div className="h-8 w-20 bg-muted/50 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="h-fit shadow-sm hover:shadow-md transition-shadow duration-200 p-1 md:p-2"
        >
          <CardHeader className="p-3">
            <CardTitle className="text-base font-semibold pl-2 border-l-4 border-primary/50">
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-1 pt-0 md:gap-3 md:p-4 md:pt-0">
            {category.items.map((item) => {
              let iconName = "";
              let colorValue = "";
              try {
                if (item.item_style) {
                  const parsed =
                    typeof item.item_style === "string"
                      ? JSON.parse(item.item_style)
                      : item.item_style;
                  iconName = parsed?.style?.icon || parsed?.icon || "";
                  colorValue = parsed?.style?.color || parsed?.color || "";
                }
              } catch (e) {}
              return (
                <HadbitItemButton
                  key={item.id}
                  text={item.short_name || item.name}
                  icon={iconName}
                  color={colorValue}
                  onClick={() => onAddLog(item)}
                  className="h-auto py-2 px-2 text-xs md:text-sm font-medium bg-background hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm border-muted group"
                />
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
