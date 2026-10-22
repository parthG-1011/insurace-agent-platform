import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* One panel, one family: navy → deeper navy. No second hue, no glass. */}
      <div className="hidden flex-col justify-between bg-primary bg-gradient-to-b from-primary to-primary-hover p-12 text-primary-fg lg:flex">
        {/* The mark defaults to `bg-primary`, which is invisible on a panel that
            is itself primary. `bg-primary-fg` inverts against whatever the panel
            resolves to, so it stays legible in both themes. */}
        <Logo className="[&>div]:bg-primary-fg [&>div]:text-primary" />
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">
            From first conversation to active policy, in one place.
          </h2>
          <p className="text-primary-fg/75">
            Capture customer details, see the plans they qualify for, share a personalised proposal and a payment link on
            WhatsApp, and the policy starts as soon as they pay.
          </p>
        </div>
        <p className="text-sm text-primary-fg/60">Term · Health · Vehicle · Travel · Home</p>
      </div>
      <div className="flex flex-col bg-canvas">
        {/* The auth screens get the same theme control as the app shell — without
            it these routes are locked to whatever the canvas resolves to. */}
        <div className="flex justify-end px-4 py-4">
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-14">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}