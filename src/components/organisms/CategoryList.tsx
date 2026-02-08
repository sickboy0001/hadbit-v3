"use client";

import { CategoryNode, ItemNode } from "@/services/hadbititems_service";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HadbitCategoryCard } from "@/components/organisms/HadbitCategoryCard";
import { HadbitItemRow } from "@/components/molecules/HadbitItemRow";

interface CategoryListProps {
  categories: CategoryNode[];
  onEditCategory: (category: CategoryNode) => void;
  onAddItem: (categoryId: number) => void;
  onDeleteCategory: (category: CategoryNode) => void;
  onEditItem: (item: ItemNode) => void;
  onDeleteItem: (item: ItemNode) => void;
}

export function CategoryList({
  categories,
  onEditCategory,
  onAddItem,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
}: CategoryListProps) {
  return (
    <div className="space-y-2">
      <SortableContext
        items={categories.map((c) => `cat-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {categories.map((category) => (
          <HadbitCategoryCard
            key={category.id}
            category={category}
            onEdit={onEditCategory}
            onAddItem={onAddItem}
            onDelete={onDeleteCategory}
          >
            <SortableContext
              items={category.items.map((i) => `item-${i.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-muted/30">
                {category.items.map((item) => (
                  <HadbitItemRow
                    key={item.id}
                    item={item}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
                {category.items.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground italic">
                    項目が登録されていません。
                  </div>
                )}
              </div>
            </SortableContext>
          </HadbitCategoryCard>
        ))}
      </SortableContext>
    </div>
  );
}
