import { parseISO } from "date-fns";

/**
 * データベースから取得した日時データを安全にDateオブジェクトに変換します。
 * タイムゾーン情報が欠落している場合や、ドライバによってローカル時間として解釈されてしまったUTC時間を補正します。
 */
export const getSafeDate = (dateVal: string | Date): Date => {
  if (typeof dateVal === "string") {
    // 末尾にZがない場合は付与してUTCとして扱う
    const dateStr = dateVal.endsWith("Z") ? dateVal : `${dateVal}Z`;
    return parseISO(dateStr);
  }

  // Dateオブジェクトの場合、DBのUTC値がローカル時間として解釈されている可能性があるため
  // 各コンポーネント(年、月、日、時...)をそのままUTCとして扱うように再構築する
  return new Date(
    Date.UTC(
      dateVal.getFullYear(),
      dateVal.getMonth(),
      dateVal.getDate(),
      dateVal.getHours(),
      dateVal.getMinutes(),
      dateVal.getSeconds(),
      dateVal.getMilliseconds(),
    ),
  );
};
