export const getSafeDate = (dateInput: string | Date): Date => {
  if (dateInput instanceof Date) {
    // Dateオブジェクトの場合、ローカル時刻として解釈されている値をUTCとして再解釈する
    // 例: DBの"03:00"がJST 03:00としてDate化されている場合、それをUTC 03:00 (JST 12:00)に変換
    return new Date(
      Date.UTC(
        dateInput.getFullYear(),
        dateInput.getMonth(),
        dateInput.getDate(),
        dateInput.getHours(),
        dateInput.getMinutes(),
        dateInput.getSeconds(),
        dateInput.getMilliseconds(),
      ),
    );
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
