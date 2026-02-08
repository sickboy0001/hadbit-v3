"use client";

import { useState, useEffect } from "react";
import {
  getHadbitItems,
  CategoryNode,
  ItemNode,
  updateCategoryOrderAction,
  updateItemOrderAction,
  deleteItemAction,
  deleteCategoryAction,
} from "@/services/hadbititems_service";
import { HadbitItemRow } from "@/components/molecules/HadbitItemRow";
import { HadbitCategoryCard } from "@/components/organisms/HadbitCategoryCard";
import {
  ItemEditDialog,
  ItemEditMode,
} from "@/components/organisms/ItemEditDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ItemsProps {
  userId: string;
}

// --- Main Component ---

export default function Items({ userId }: ItemsProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<ItemNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ItemNode | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryNode | null>(
    null,
  );
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [creatingItemCategoryId, setCreatingItemCategoryId] = useState<
    number | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHadbitItems(userId);
        setCategories(data);
        setExpandedCategories(data.map((c) => c.id));
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const toggleCategory = (id: number) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setEditingItem(null);
    setIsCreatingCategory(true);
    setCreatingItemCategoryId(null);
    setEditModalOpen(true);
  };

  const handleEditCategory = (category: CategoryNode) => {
    setEditingCategory(category);
    setEditingItem(null);
    setIsCreatingCategory(false);
    setCreatingItemCategoryId(null);
    setEditModalOpen(true);
  };

  const handleCreateItem = (categoryId: number) => {
    setEditingCategory(null);
    setEditingItem(null);
    setIsCreatingCategory(false);
    setCreatingItemCategoryId(categoryId);
    setEditModalOpen(true);
  };

  const handleEditItem = (item: ItemNode) => {
    setEditingItem(item);
    setEditingCategory(null);
    setIsCreatingCategory(false);
    setCreatingItemCategoryId(null);
    setEditModalOpen(true);
  };

  const handleDialogSuccess = (data: any) => {
    if (isCreatingCategory) {
      setCategories([
        ...categories,
        {
          id: data.id,
          name: data.name,
          items: [],
          description: data.description,
          color: data.color,
          icon: data.icon,
        } as CategoryNode,
      ]);
      setExpandedCategories((prev) => [...prev, data.id]);
      toast.success("カテゴリを作成しました");
    } else if (creatingItemCategoryId !== null) {
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === creatingItemCategoryId) {
            return {
              ...cat,
              items: [...cat.items, data],
            };
          }
          return cat;
        }),
      );
      toast.success("項目を作成しました");
    } else if (editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: data.name,
                description: data.description,
                color: data.color,
                icon: data.icon,
              }
            : cat,
        ),
      );
      toast.success("カテゴリを更新しました");
    } else if (editingItem) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  name: data.name,
                  short_name: data.short_name,
                  description: data.description,
                  color: data.color,
                  icon: data.icon,
                }
              : item,
          ),
        })),
      );
      toast.success("項目を更新しました");
    }
  };

  const handleDeleteClick = (item: ItemNode) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCategoryClick = (category: CategoryNode) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (itemToDelete) {
        await deleteItemAction(itemToDelete.id);
        // ローカルstateの更新（全カテゴリから該当アイテムを削除）
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            items: cat.items.filter((i) => i.id !== itemToDelete.id),
          })),
        );
        toast.success("項目を削除しました");
      } else if (categoryToDelete) {
        await deleteCategoryAction(categoryToDelete.id);
        setCategories((prev) =>
          prev.filter((c) => c.id !== categoryToDelete.id),
        );
        toast.success("カテゴリを削除しました");
      }
    } catch (error) {
      toast.error("削除に失敗しました");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setCategoryToDelete(null);
    }
  };

  const findContainer = (id: UniqueIdentifier) => {
    const idStr = String(id);
    if (idStr.startsWith("cat-")) {
      const catId = parseInt(idStr.replace("cat-", ""));
      return categories.find((c) => c.id === catId);
    }
    return categories.find((c) =>
      c.items.some((i) => `item-${i.id}` === idStr),
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Only handle item dragging
    if (!activeId.startsWith("item-")) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer.id === overContainer.id
    ) {
      return;
    }

    setCategories((prev) => {
      const activeItems = activeContainer.items;
      const overItems = overContainer.items;
      const activeIndex = activeItems.findIndex(
        (i) => `item-${i.id}` === activeId,
      );
      const overIndex = overItems.findIndex((i) => `item-${i.id}` === overId);

      let newIndex;
      if (overId.startsWith("cat-")) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((c) => {
        if (c.id === activeContainer.id) {
          return {
            ...c,
            items: activeItems.filter(
              (item) => item.id !== activeItems[activeIndex].id,
            ),
          };
        } else if (c.id === overContainer.id) {
          return {
            ...c,
            items: [
              ...overItems.slice(0, newIndex),
              activeItems[activeIndex],
              ...overItems.slice(newIndex, overItems.length),
            ],
          };
        } else {
          return c;
        }
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Category Reordering
    if (activeId.startsWith("cat-") && overId.startsWith("cat-")) {
      if (activeId !== overId) {
        const oldIndex = categories.findIndex(
          (c) => `cat-${c.id}` === activeId,
        );
        const newIndex = categories.findIndex((c) => `cat-${c.id}` === overId);
        const newItems = arrayMove(categories, oldIndex, newIndex);

        setCategories(newItems);

        // サーバーへ順序を保存
        updateCategoryOrderAction(newItems.map((c) => c.id)).catch(() => {
          toast.error("カテゴリの並び順保存に失敗しました");
        });
      }
    }

    // Item Reordering (within same category)
    if (activeId.startsWith("item-")) {
      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (
        activeContainer &&
        overContainer &&
        activeContainer.id === overContainer.id
      ) {
        const activeIndex = activeContainer.items.findIndex(
          (i) => `item-${i.id}` === activeId,
        );
        const overIndex = overId.startsWith("cat-")
          ? activeContainer.items.length - 1
          : activeContainer.items.findIndex((i) => `item-${i.id}` === overId);

        let newItems = activeContainer.items;

        if (activeIndex !== overIndex) {
          newItems = arrayMove(activeContainer.items, activeIndex, overIndex);
          setCategories((prev) =>
            prev.map((c) =>
              c.id === activeContainer.id ? { ...c, items: newItems } : c,
            ),
          );
        }

        // サーバーへ順序を保存 (カテゴリ移動があった場合もここで保存される)
        updateItemOrderAction(
          activeContainer.id,
          newItems.map((i) => i.id),
        ).catch(() => {
          toast.error("項目の並び順保存に失敗しました");
        });
      }
    }
  };

  const editMode: ItemEditMode = isCreatingCategory
    ? "createCategory"
    : creatingItemCategoryId !== null
      ? "createItem"
      : editingCategory
        ? "editCategory"
        : "editItem";

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 w-1/2 mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">項目管理</h1>
          <p className="text-muted-foreground mt-1">
            カテゴリと習慣の階層構造を編集します。
          </p>
        </div>
        <Button
          className="gap-2 shadow-lg shadow-primary/20"
          onClick={handleCreateCategory}
        >
          <Plus className="h-4 w-4" />
          新規カテゴリ
        </Button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="space-y-2">
          <SortableContext
            items={categories.map((c) => `cat-${c.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {categories.map((category) => (
              <HadbitCategoryCard
                key={category.id}
                category={category}
                isExpanded={expandedCategories.includes(category.id)}
                onToggle={() => toggleCategory(category.id)}
                onEdit={handleEditCategory}
                onAddItem={handleCreateItem}
                onDelete={handleDeleteCategoryClick}
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
                        onEdit={handleEditItem}
                        onDelete={handleDeleteClick}
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
      </DndContext>

      <ItemEditDialog
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        mode={editMode}
        userId={userId}
        categoryId={creatingItemCategoryId}
        editingId={editingCategory?.id || editingItem?.id}
        initialValues={{
          name: editingCategory?.name || editingItem?.name || "",
          shortName: editingItem?.short_name || "",
          description:
            (editingCategory as any)?.description ||
            (editingItem as any)?.description ||
            "",
          color:
            (editingCategory as any)?.color ||
            (editingItem as any)?.color ||
            "",
          icon:
            (editingCategory as any)?.icon || (editingItem as any)?.icon || "",
        }}
        onSuccess={handleDialogSuccess}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>項目の削除</DialogTitle>
            <DialogDescription>
              本当に「{itemToDelete?.name || categoryToDelete?.name}
              」を削除しますか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
