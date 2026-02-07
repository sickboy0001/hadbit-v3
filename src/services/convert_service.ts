"use server";

import { executeQuery } from "@/lib/actions";

export async function getPreviewData(userId: string, email: string) {
  // 1. Old User ID の取得 (mail_to_id テーブル)
  const idQuery = `SELECT id FROM mail_to_id WHERE mail = '${email}'`;
  const idResult = await executeQuery(idQuery);

  if (
    !idResult.success ||
    !Array.isArray(idResult.data) ||
    idResult.data.length === 0
  ) {
    return { error: `旧ユーザーIDが見つかりません: ${email}` };
  }

  const oldUserId = idResult.data[0].id;

  // 2. 旧データの件数取得
  const oldItemsQuery = `SELECT COUNT(*) as count FROM habit_items WHERE user_id = ${oldUserId}`;
  const oldLogsQuery = `SELECT COUNT(*) as count FROM habit_logs WHERE user_id = ${oldUserId}`;

  // 3. 新データの件数取得 (削除対象となる現在のデータ)
  const newItemsQuery = `SELECT COUNT(*) as count FROM hadbit_items WHERE user_id = '${userId}'`;
  const newLogsQuery = `SELECT COUNT(*) as count FROM hadbit_logs WHERE user_id = '${userId}'`;

  const [oldItemsRes, oldLogsRes, newItemsRes, newLogsRes] = await Promise.all([
    executeQuery(oldItemsQuery),
    executeQuery(oldLogsQuery),
    executeQuery(newItemsQuery),
    executeQuery(newLogsQuery),
  ]);

  return {
    target_email: email,
    old_user_id: oldUserId,
    new_user_uuid: userId,
    old_data: {
      items_count: Number(oldItemsRes.data?.[0]?.count || 0),
      logs_count: Number(oldLogsRes.data?.[0]?.count || 0),
    },
    new_data: {
      items_count: Number(newItemsRes.data?.[0]?.count || 0),
      logs_count: Number(newLogsRes.data?.[0]?.count || 0),
    },
  };
}

export async function executeConversion(userId: string, email: string) {
  // データ移行を実行する
  // トランザクションとして実行するために DO ブロックを使用
  const conversionQuery = `
      DO $$
      DECLARE
          v_old_user_id integer;
          v_new_user_uuid uuid := '${userId}';
          v_email text := '${email}';
      BEGIN
          -- ID再取得
          SELECT id INTO v_old_user_id FROM mail_to_id WHERE mail = v_email;
          
          IF v_old_user_id IS NULL THEN
              RAISE EXCEPTION '旧ユーザーIDが見つかりません: %', v_email;
          END IF;

          -- 1. 新テーブルから対象ユーザーの既存データを削除
          DELETE FROM hadbit_logs WHERE user_id = v_new_user_uuid;
          DELETE FROM hadbit_items WHERE user_id = v_new_user_uuid;
          
          -- 2. hadbit_items への移行
          INSERT INTO hadbit_items (
              user_id, name, short_name, description, 
              parent_flag, public_flag, visible_flag, delete_flag, 
              updated_at, created_at, item_style, is_deleted
          )
          SELECT 
              v_new_user_uuid, name, short_name, description, 
              parent_flag, public_flag, visible_flag, delete_flag, 
              updated_at, created_at, item_style, delete_flag
          FROM habit_items
          WHERE user_id = v_old_user_id
          ORDER BY id ASC;
          
          -- 3. hadbit_trees への移行
          INSERT INTO hadbit_trees (item_id, user_id, parent_id, order_no)
          SELECT 
              new_item.id,
              v_new_user_uuid,
              parent_item.id,
              tree.order_no
          FROM habit_item_tree tree
          JOIN habit_items old_item ON tree.item_id = old_item.id
          JOIN hadbit_items new_item ON new_item.name = old_item.name AND new_item.user_id = v_new_user_uuid
          LEFT JOIN habit_items old_parent ON tree.parent_id = old_parent.id
          LEFT JOIN hadbit_items parent_item ON parent_item.name = old_parent.name AND parent_item.user_id = v_new_user_uuid
          WHERE old_item.user_id = v_old_user_id;

          -- 4. hadbit_logs への移行
          INSERT INTO hadbit_logs (
              user_id, item_id, done_at, updated_at, created_at, comment
          )
          SELECT 
              v_new_user_uuid,
              new_item.id,
              logs.done_at,
              logs.updated_at,
              logs.created_at,
              logs.comment
          FROM habit_logs logs
          JOIN habit_items old_item ON logs.item_id = old_item.id
          JOIN hadbit_items new_item ON new_item.name = old_item.name AND new_item.user_id = v_new_user_uuid
          WHERE logs.user_id = v_old_user_id;
          
          -- 5. parent_id の補正 (NULL -> 0)
          UPDATE hadbit_trees
          SET parent_id = 0
          WHERE user_id = v_new_user_uuid
          AND parent_id IS NULL;
      END $$;
    `;

  const result = await executeQuery(conversionQuery);

  if (!result.success) {
    console.error("Conversion failed:", result.error);
    throw new Error(`データ移行に失敗しました: ${result.error}`);
  }

  // 実行後の件数確認
  const finalItemsQuery = `SELECT COUNT(*) as count FROM hadbit_items WHERE user_id = '${userId}'`;
  const finalLogsQuery = `SELECT COUNT(*) as count FROM hadbit_logs WHERE user_id = '${userId}'`;

  const [finalItemsRes, finalLogsRes] = await Promise.all([
    executeQuery(finalItemsQuery),
    executeQuery(finalLogsQuery),
  ]);

  return {
    status: "success",
    items_count: Number(finalItemsRes.data?.[0]?.count || 0),
    logs_count: Number(finalLogsRes.data?.[0]?.count || 0),
  };
}
