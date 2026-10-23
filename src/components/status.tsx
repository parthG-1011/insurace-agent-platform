import type { ProposalStatus } from "@/lib/db/schema";
import { STATUS_LABEL, STATUS_STEPS, STATUS_TONE, statusIndex } from "@/lib/insurance/status";
import { Badge, cx } from "./ui";

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function StatusStepper({ status }: { status: ProposalStatus }) {
  const current = statusIndex(status);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step.status} className="flex items-center gap-2">
            <span
              className={cx(
                "flex items-center gap-1.5 rounded-full px-2 py-1 font-medium",
                done ? "bg-success-tint text-success-ink" : "bg-elevated text-ink-faint",
              )}
            >
              <span className={cx("h-1.5 w-1.5 rounded-full", done ? "bg-success" : "bg-line")} />
              {step.label}
            </span>
            {i < STATUS_STEPS.length - 1 && <span className={cx("h-px w-3", done ? "bg-success/50" : "bg-line")} />}
          </li>
        );
      })}
    </ol>
  );
}
