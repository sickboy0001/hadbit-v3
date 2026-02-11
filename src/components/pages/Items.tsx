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
import { CategoryList } from "@/components/organisms/CategoryList";
import {
  ItemEditDialog,
  ItemEditMode,
} from "@/components/organisms/ItemEditDialog";
import { ItemDeleteDialog } from "@/components/organisms/ItemDeleteDialog";
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";

interface ItemsProps {
  userId: string;
}

// --- Main Component ---

export default function Items({ userId }: ItemsProps) {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
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
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

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
          item_style: data.item_style,
        } as CategoryNode,
      ]);
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
            ? ({
                ...cat,
                name: data.name,
                description: data.description,
                item_style: data.item_style,
              } as CategoryNode)
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
                  item_style: data.item_style,
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

  const getInitialStyle = () => {
    const target = editingCategory || editingItem;
    if (!target) return { color: "", icon: "" };

    const targetAny = target as any;
    if (targetAny.item_style) {
      try {
        const parsed =
          typeof targetAny.item_style === "string"
            ? JSON.parse(targetAny.item_style)
            : targetAny.item_style;
        return {
          color: parsed?.style?.color || parsed?.color || "",
          icon: parsed?.style?.icon || parsed?.icon || "",
        };
      } catch {
        // ignore
      }
    }
    return { color: "", icon: "" };
  };
  const { color: initialColor, icon: initialIcon } = getInitialStyle();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 mx-auto w-fit">
      <header className="flex items-center justify-between gap-8">
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
        <CategoryList
          categories={categories}
          onEditCategory={handleEditCategory}
          onAddItem={handleCreateItem}
          onDeleteCategory={handleDeleteCategoryClick}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteClick}
        />
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
          color: initialColor,
          icon: initialIcon,
          item_style:
            (editingCategory as any)?.item_style ||
            (editingItem as any)?.item_style ||
            "",
        }}
        onSuccess={handleDialogSuccess}
      />

      <ItemDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={itemToDelete}
        category={categoryToDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
