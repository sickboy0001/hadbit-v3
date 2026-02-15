"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CategoryNode,
  ItemNode,
  getHadbitItems,
} from "@/services/hadbititems_service";
import { HadbitItemButton } from "@/components/molecules/HadbitItemButton";
import { ChevronDown, ChevronRight } from "lucide-react";

interface LogRegistrarProps {
  userId: string;
  onAddLog: (item: ItemNode) => void;
}

function CategoryCard({
  category,
  onAddLog,
}: {
  category: CategoryNode;
  onAddLog: (item: ItemNode) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const storageKey = `hadbit_category_open_${category.id}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      setIsOpen(saved === "true");
    }
  }, [storageKey]);

  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem(storageKey, String(newState));
  };

  return (
    <Card className="h-fit shadow-sm hover:shadow-md transition-shadow duration-200 p-1 gap-3 md:p-2">
      <div
        className="px-3 pt-3 pb-1 cursor-pointer flex flex-row items-center justify-between"
        onClick={toggleOpen}
      >
        <div className="text-base font-semibold pl-2 border-l-4 border-primary/50">
          {category.name}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {isOpen && (
        <CardContent className="flex flex-wrap gap-2 p-2 md:gap-2 md:p-4 md:pt-0">
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
                className="h-auto  py-1.5 md:py-1 p-2 md:p-2 text-sm md:text-sm font-medium bg-background hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm border-muted group "
              />
            );
          })}
        </CardContent>
      )}
    </Card>
  );
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
    <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-2 p-1 md:p-2">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onAddLog={onAddLog}
        />
      ))}
    </div>
  );
}
