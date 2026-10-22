import { cx } from "./ui";

/**
 * The dashboard's anchor tile. This is the one deliberately-treated object on
 * the screen: a 3px left rule in the metric's semantic colour is the only place
 * in the product where colour encodes meaning, and the figure is set large in
 * tabular numerals so a column of numbers stays scannable. No drop shadow —
 * the surface is separated by a hairline border like every other tile.
 *
 * Tone is data, not decoration: `neutral` is a count of people (no signal),
 * `info` quotes still in play, `warning` money owed to the insurer,
 * `success` cover actually running.
 */
export type StatTone = "neutral" | "info" | "warning" | "success";

const toneRule: Record<StatTone, string> = {
  neutral: "border-l-fg-subtle",
  info: "border-l-info",
  warning: "border-l-warning",
  success: "border-l-success",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number;
  hint: string;
  tone?: StatTone;
}) {
  return (
    <div className={cx("rounded-card border border-line border-l-[3px] bg-surface p-4", toneRule[tone])}>
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-fg-subtle">{hint}</p>
    </div>
  );
}