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
                done ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400",
              )}
            >
              <span className={cx("h-1.5 w-1.5 rounded-full", done ? "bg-emerald-500" : "bg-slate-300")} />
              {step.label}
            </span>
            {i < STATUS_STEPS.length - 1 && <span className={cx("h-px w-3", done ? "bg-emerald-300" : "bg-slate-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
