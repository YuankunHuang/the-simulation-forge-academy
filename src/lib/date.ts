/** 日期工具 — 全部基于本地时区的 YYYY-MM-DD 字符串，保证引擎可测试。 */

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

/** b - a 的天数（b 晚于 a 为正） */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / 86_400_000);
}

export type TimeOfDay = "morning" | "afternoon" | "evening";

export function timeOfDay(d = new Date()): TimeOfDay {
  const h = d.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export interface Momentum {
  /** 以今天（或昨天）结尾的连续活跃天数 */
  streakDays: number;
  /** 0 余烬 / 1 小火苗 / 2 稳定火焰 / 3 旺火 */
  level: 0 | 1 | 2 | 3;
  /** 距上次活跃的天数 */
  awayDays: number;
}

/** 动量之火：只描述状态，不制造愧疚。 */
export function computeMomentum(activeDates: string[], today: string): Momentum {
  if (activeDates.length === 0) {
    return { streakDays: 0, level: 0, awayDays: Number.MAX_SAFE_INTEGER };
  }
  const set = new Set(activeDates);
  const sorted = [...activeDates].sort();
  const last = sorted[sorted.length - 1];
  const awayDays = Math.max(0, diffDays(last, today));

  // 连续段允许从今天或昨天开始往回数
  let anchor: string | null = null;
  if (set.has(today)) anchor = today;
  else if (set.has(addDays(today, -1))) anchor = addDays(today, -1);

  let streak = 0;
  if (anchor) {
    let cur = anchor;
    while (set.has(cur)) {
      streak++;
      cur = addDays(cur, -1);
    }
  }

  let level: Momentum["level"] = 0;
  if (streak >= 7) level = 3;
  else if (streak >= 3) level = 2;
  else if (streak >= 1) level = 1;

  return { streakDays: streak, level, awayDays };
}

export function formatDateZh(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y} 年 ${m} 月 ${d} 日`;
}

export function formatIsoZh(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}
