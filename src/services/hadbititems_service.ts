"use server";

import { executeQuery } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ItemNode = {
  id: number;
  name: string;
  short_name: string | null;
};

export type CategoryNode = {
  id: number;
  name: string;
  items: ItemNode[];
};

export async function getHadbitItems(userId: string): Promise<CategoryNode[]> {
  const query = `
SELECT 
    i.id, 
    i.name, 
    i.short_name, 
    t.parent_id, 
    t.order_no as tree_order
FROM hadbit_items i
LEFT JOIN hadbit_trees t ON t.item_id = i.id
WHERE i.user_id = '${userId}'
ORDER BY t.order_no ASC
  `;

  const result = await executeQuery(query);

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch items:", result.error);
    return [];
  }
  // console.log("Fetched items:", result.data);
  const rows = result.data;
  const categories: CategoryNode[] = [];
  const itemsMap = new Map<number, any[]>();
  const allIds = new Set(rows.map((r: any) => r.id));

  // 1. カテゴリ(親を持たない項目、または親がリストにない項目)とアイテムを分離
  rows.forEach((row: any) => {
    // 親IDがない、または親IDが取得したリスト内に存在しない場合はカテゴリ(ルート)とみなす
    if (row.parent_id == null || !allIds.has(row.parent_id)) {
      categories.push({
        id: row.id,
        name: row.name,
        items: [],
      });
    } else {
      if (!itemsMap.has(row.parent_id)) {
        itemsMap.set(row.parent_id, []);
      }
      itemsMap.get(row.parent_id)!.push(row);
    }
  });

  // 2. カテゴリにアイテムを紐付け
  categories.forEach((cat) => {
    const items = itemsMap.get(cat.id) || [];
    // tree_order順にソート
    items.sort((a, b) => (a.tree_order || 0) - (b.tree_order || 0));

    cat.items = items.map((item) => ({
      id: item.id,
      name: item.name,
      short_name: item.short_name,
    }));
  });

  return categories;
}

export async function updateCategoryAction(
  id: number,
  name: string,
  short_name: string | null,
  description: string | null,
  item_style: string | null,
) {
  const supabase = await createClient();

  // カテゴリも hadbit_items テーブルにあると推測されるため hadbit_items を更新
  const { error } = await supabase
    .from("hadbit_items")
    .update({
      name,
      short_name: short_name || null,
      description: description || null,
      item_style: item_style || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating category:", error);
    throw new Error("カテゴリの更新に失敗しました");
  }

  revalidatePath("/hadbit/items");
  return { success: true };
}

export async function createCategoryAction(
  userId: string,
  name: string,
  short_name: string,
  description: string,
  item_style: string,
) {
  //{"icon":"ChartPie","color":"#008B02"}
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hadbit_items")
    .insert({ user_id: userId, name, short_name, description, item_style })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw new Error("カテゴリの作成に失敗しました");
  }

  // 2. カテゴリの順序を設定するために hadbit_trees にも追加
  const { data: maxOrderData } = await supabase
    .from("hadbit_trees")
    .select("order_no")
    .is("parent_id", null)
    .order("order_no", { ascending: false })
    .limit(1);

  const nextOrder = (maxOrderData?.[0]?.order_no || 0) + 1;

  const { error: treeError } = await supabase.from("hadbit_trees").insert({
    item_id: data.id,
    parent_id: null,
    order_no: nextOrder,
    user_id: userId,
  });

  if (treeError) {
    console.error(
      "Error creating category tree:",
      JSON.stringify(treeError, null, 2),
    );
    throw new Error(`カテゴリの関連付けに失敗しました: ${treeError.message}`);
  }

  revalidatePath("/hadbit/items");
  return { success: true, data };
}

export async function createItemAction(
  userId: string,
  categoryId: number,
  name: string,
  short_name: string | null,
  description: string | null,
  item_style: string | null,
) {
  const supabase = await createClient();

  // 1. アイテムを作成
  const { data: itemData, error: itemError } = await supabase
    .from("hadbit_items")
    .insert({
      user_id: userId,
      name,
      short_name: short_name || null,
      description: description || null,
      item_style: item_style || null,
    })
    .select()
    .single();

  if (itemError) {
    console.error("Error creating item:", itemError);
    throw new Error("項目の作成に失敗しました");
  }

  // 2. カテゴリ内の最大順序を取得
  const { data: maxOrderData } = await supabase
    .from("hadbit_trees")
    .select("order_no")
    .eq("parent_id", categoryId)
    .order("order_no", { ascending: false })
    .limit(1);

  const nextOrder = (maxOrderData?.[0]?.order_no || 0) + 1;

  // 3. ツリー構造に紐付け
  const { error: treeError } = await supabase.from("hadbit_trees").insert({
    item_id: itemData.id,
    parent_id: categoryId,
    order_no: nextOrder,
    user_id: userId,
  });

  if (treeError) {
    console.error(
      "Error creating item tree:",
      JSON.stringify(treeError, null, 2),
    );
    throw new Error(`項目の関連付けに失敗しました: ${treeError.message}`);
  }

  revalidatePath("/hadbit/items");
  return { success: true, data: itemData };
}

export async function updateCategoryOrderAction(orderedIds: number[]) {
  const supabase = await createClient();

  // カテゴリの順序を更新 (hadbit_items.order_no)
  // 並列で更新を実行
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("hadbit_trees")
      .update({ order_no: index + 1 })
      .eq("item_id", id),
  );

  await Promise.all(updates);
  revalidatePath("/hadbit/items");
  return { success: true };
}

export async function updateItemOrderAction(
  categoryId: number,
  orderedItemIds: number[],
) {
  const supabase = await createClient();

  // 項目の順序を更新 (hadbit_trees.order_no)
  const updates = orderedItemIds.map((id, index) =>
    supabase
      .from("hadbit_trees")
      .update({ order_no: index + 1, parent_id: categoryId })
      .eq("item_id", id),
  );

  await Promise.all(updates);
  revalidatePath("/hadbit/items");
  return { success: true };
}

export async function updateItemAction(
  id: number,
  name: string,
  short_name: string | null,
  description: string | null,
  item_style: string | null,
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hadbit_items")
    .update({
      name,
      short_name: short_name || null,
      description: description || null,
      item_style: item_style || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating item:", error);
    throw new Error("項目の更新に失敗しました");
  }

  revalidatePath("/hadbit/items");
  return { success: true };
}

export async function deleteItemAction(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("hadbit_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting item:", error);
    throw new Error("項目の削除に失敗しました");
  }

  revalidatePath("/hadbit/items");
  return { success: true };
}

export async function deleteCategoryAction(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from("hadbit_items").delete().eq("id", id);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error("カテゴリの削除に失敗しました");
  }

  revalidatePath("/hadbit/items");
  return { success: true };
}
