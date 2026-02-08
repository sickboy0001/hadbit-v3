"use server";

import { executeQuery } from "@/lib/actions";

export type ItemNode = {
  id: number;
  name: string;
  short_name: string | null;
};

export type hadbitlog = {
  log_id: number;
  done_at: string;
  item_id: number;
  comment: string | null;
  category_id: number;
  category_name: string;
  category_short_name: string | null;
  master_id: number;
  master_name: string;
  master_short_name: string | null;
};

export async function getHadbitLogs(
  userId: string,
  startDate?: string,
  endDate?: string,
): Promise<hadbitlog[]> {
  const now = new Date();
  const end = endDate ?? now.toISOString();
  const start =
    startDate ??
    new Date(
      new Date().setFullYear(new Date().getFullYear() - 1),
    ).toISOString();

  const query = `
    SELECT 
        logs.id AS log_id,
        logs.done_at AS done_at,
        logs.item_id AS item_id,
        logs.comment,
        category.id AS category_id, 
        category.name AS category_name, 
        category.short_name AS category_short_name,
        master.id AS master_id, 
        master.name AS master_name, 
        master.short_name AS master_short_name
    FROM hadbit_logs logs
    INNER JOIN hadbit_items master ON master.id = logs.item_id
    INNER JOIN hadbit_trees tree ON tree.item_id = logs.item_id
    INNER JOIN hadbit_items category ON category.id = tree.parent_id
    WHERE logs.user_id = '${userId}'
      AND logs.done_at >= '${start}'
      AND logs.done_at <= '${end}'
    ORDER BY logs.done_at DESC, master.id DESC
  `;
  const result = await executeQuery(query);

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch logs:", result.error);
    return [];
  }

  return result.data as unknown as hadbitlog[];
}

export async function createHadbitLog(
  userId: string,
  itemId: number,
  doneAt: string,
) {
  const query = `
    INSERT INTO hadbit_logs (user_id, item_id, done_at)
    VALUES ('${userId}', ${itemId}, '${doneAt}')
    RETURNING id
  `;
  return await executeQuery(query);
}

export async function deleteHadbitLog(userId: string, logId: number) {
  const query = `
    DELETE FROM hadbit_logs WHERE id = ${logId} AND user_id = '${userId}'
  `;
  return await executeQuery(query);
}

export async function updateHadbitLog(
  userId: string,
  logId: number,
  doneAt: string,
  comment: string | null,
) {
  const commentVal = comment ? `'${comment}'` : "NULL";
  const query = `
    UPDATE hadbit_logs SET done_at = '${doneAt}', comment = ${commentVal} WHERE id = ${logId} AND user_id = '${userId}'
  `;
  return await executeQuery(query);
}
