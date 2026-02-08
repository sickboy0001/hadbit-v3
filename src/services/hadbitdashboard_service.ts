"use server";

import { executeQuery } from "@/lib/actions";
import { hadbitlog } from "./hadbitlogs_service";

export type DailyActivityCount = {
  active_date: string;
  activity_count: number;
};

export async function getDailyActivityCounts(
  userId: string,
): Promise<DailyActivityCount[]> {
  const query = `
    SELECT 
        TO_CHAR(logs.done_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo', 'YYYY-MM-DD') AS active_date,
        COUNT(logs.id) AS activity_count
    FROM hadbit_logs logs
    WHERE 
        logs.user_id = '${userId}'
        AND logs.done_at >= (CURRENT_TIMESTAMP - INTERVAL '8 days')
    GROUP BY 
        active_date
    ORDER BY 
        active_date DESC
  `;
  const result = await executeQuery(query);

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch daily activity counts:", result.error);
    return [];
  }

  return result.data as unknown as DailyActivityCount[];
}

export async function getCurrentStreak(userId: string): Promise<number> {
  const query = `
    WITH daily_logs AS (
        -- 1. まず日別のユニークな日付リストを作る（JST変換込）
        SELECT DISTINCT
            DATE(done_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo') AS log_date
        FROM hadbit_logs
        WHERE user_id = '${userId}'
    ),
    streaks AS (
        -- 2. 日付から連番（ROW_NUMBER）を引くことで、連続している日を同じグループにする
        SELECT 
            log_date,
            log_date - (ROW_NUMBER() OVER (ORDER BY log_date))::int AS grp
        FROM daily_logs
    ),
    current_streak AS (
        -- 3. 直近のグループ（今日、または昨日を含むグループ）の件数を数える
        SELECT 
            COUNT(*) AS streak_count,
            MAX(log_date) AS last_date
        FROM streaks
        GROUP BY grp
    )
    SELECT streak_count
    FROM current_streak
    WHERE last_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo')::date - INTERVAL '1 day' -- 昨日から
    ORDER BY last_date DESC
    LIMIT 1;
  `;
  const result = await executeQuery(query);

  if (
    !result.success ||
    !Array.isArray(result.data) ||
    result.data.length === 0
  ) {
    return 0;
  }

  return (result.data as any)[0].streak_count as number;
}

export type TopActivity = {
  master_name: string;
  category_name: string;
  activity_count: number;
};

export async function getTopActivities(userId: string): Promise<TopActivity[]> {
  const query = `
    SELECT 
        master.name AS master_name,
        category.name AS category_name,
        COUNT(logs.id) AS activity_count
    FROM hadbit_logs logs
    INNER JOIN hadbit_items master ON master.id = logs.item_id
    INNER JOIN hadbit_trees tree ON tree.item_id = logs.item_id
    INNER JOIN hadbit_items category ON category.id = tree.parent_id
    WHERE 
        logs.user_id = '${userId}'
        -- 直近7日間（日本時間基準）
        AND logs.done_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Tokyo' - INTERVAL '7 days')
    GROUP BY 
        master.name, category.name
    ORDER BY 
        activity_count DESC
  `;
  const result = await executeQuery(query);

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch top activities:", result.error);
    return [];
  }

  return result.data as unknown as TopActivity[];
}

export type RecentActivity = {
  log_id: number;
  done_at: string;
  master_name: string;
  category_name: string;
  comment: string | null;
};

export async function getRecentActivities(
  userId: string,
): Promise<RecentActivity[]> {
  const query = `
    SELECT 
        logs.id AS log_id,
        logs.done_at AS done_at,
        master.name AS master_name,
        category.name AS category_name,
        logs.comment
    FROM hadbit_logs logs
    INNER JOIN hadbit_items master ON master.id = logs.item_id
    INNER JOIN hadbit_trees tree ON tree.item_id = logs.item_id
    INNER JOIN hadbit_items category ON category.id = tree.parent_id
    WHERE 
        logs.user_id = '${userId}'
    ORDER BY 
        logs.done_at DESC
    LIMIT 7
  `;
  const result = await executeQuery(query);

  if (!result.success || !Array.isArray(result.data)) {
    console.error("Failed to fetch recent activities:", result.error);
    return [];
  }

  return result.data as unknown as RecentActivity[];
}
