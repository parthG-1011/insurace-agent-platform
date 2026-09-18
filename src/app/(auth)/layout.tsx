import { Logo } from "@/components/ui";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-blue-800 p-12 text-white lg:flex">
        <Logo className="[&>div]:bg-white [&>div]:text-blue-800" />
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">From first conversation to active policy, in one place.</h2>
          <p className="text-blue-100">
            Capture customer details, see the plans they qualify for, share a personalised proposal and a payment link on
            WhatsApp, and the policy starts as soon as they pay.
          </p>
        </div>
        <p className="text-sm text-blue-200">Term · Health · Vehicle · Travel · Home</p>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
