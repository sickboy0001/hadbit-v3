"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryNode, ItemNode } from "@/services/hadbititems_service";

interface LogRegistrarProps {
  categories: CategoryNode[];
  onAddLog: (item: ItemNode) => void;
}

export function LogRegistrar({ categories, onAddLog }: LogRegistrarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card
          key={category.id}
          className="h-fit shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <CardHeader className="p-3">
            <CardTitle className="text-base font-semibold pl-2 border-l-4 border-primary/50">
              {category.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-3 pt-0">
            {category.items.map((item) => (
              <Button
                key={item.id}
                onClick={() => onAddLog(item)}
                variant="outline"
                className="h-auto py-1.5 px-3 text-sm font-medium bg-background hover:border-primary hover:text-primary active:scale-95 transition-all shadow-sm border-muted group"
              >
                {item.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
