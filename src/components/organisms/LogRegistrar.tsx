"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await getHadbitItems(userId);
        setCategories(data);
        // LocalStorageから復元
        const saved = localStorage.getItem(
          "hadbit_log_registrar_selected_categories",
        );
        if (saved) {
          try {
            setSelectedCategoryIds(JSON.parse(saved));
          } catch (e) {
            setSelectedCategoryIds([]);
          }
        } else {
          setSelectedCategoryIds([]);
        }
      } catch (e) {
        console.error("Failed to fetch items for LogRegistrar", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [userId]);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => {
      const newState = prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id];
      localStorage.setItem(
        "hadbit_log_registrar_selected_categories",
        JSON.stringify(newState),
      );
      return newState;
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-fit shadow-sm">
            <CardContent className="flex flex-wrap gap-2 p-3">
              <div className="p-3 border-b">
                <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-8 w-20 bg-muted/50 animate-pulse rounded" />
              <div className="h-8 w-24 bg-muted/50 animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted/50 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1段目: カテゴリーのトグル */}
      <div className="flex flex-wrap gap-2 px-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={
              selectedCategoryIds.includes(category.id) ? "default" : "outline"
            }
            size="sm"
            onClick={() => toggleCategory(category.id)}
            className="rounded-full text-base p-4"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* 2段目: 選ばれているカテゴリーに対応するItemを表示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {categories
          .filter(
            (cat) =>
              selectedCategoryIds.length === 0 ||
              selectedCategoryIds.includes(cat.id),
          )
          .map((category) => (
            <Card key={category.id} className="h-fit shadow-sm">
              <div className="px-3 py-1 border-b bg-muted/20 text-sm font-bold text-muted-foreground">
                {category.name}
              </div>
              <CardContent className="flex flex-wrap gap-2 p-3">
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
                      className="h-auto py-1.5 px-3 text-sm font-medium bg-background hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm border-muted"
                    />
                  );
                })}
                {category.items.length === 0 && (
                  <div className="text-xs text-muted-foreground italic p-1">
                    項目なし
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
