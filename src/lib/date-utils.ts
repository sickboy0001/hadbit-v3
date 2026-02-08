export const getSafeDate = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) {
    return dateInput;
  }
  // 文字列変換とトリム、スラッシュをハイフンに統一
  let str = String(dateInput).trim().replace(/\//g, "-");
  // 空白をTに置換
  str = str.replace(" ", "T");
  // タイムゾーン指定がない（末尾がZでもタイムゾーンオフセットでもない）場合はUTCとして扱う
  if (!/Z|[+-]\d{2}:?\d{2}$/.test(str)) {
    str += "Z";
  }
  return new Date(str);
};

// UTCの日時データをJST（日本時間）に変換して表示するためのヘルパー
export const toJST = (date: Date): Date => {
  // DBから取得した時刻（UTC）をJSTとして表示するために、一律で9時間進める
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
};
