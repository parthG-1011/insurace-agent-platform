import { PageHeader } from "@/components/ui";
import { CustomerForm } from "./customer-form";

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        title="New customer"
        description="Fill this in while you're talking to the customer. Saving creates their profile."
      />
      {/* A short width keeps the two-column field grid from stretching into
          unreadable full-width inputs on a desktop. */}
      <div className="max-w-3xl">
        <CustomerForm />
      </div>
    </>
  );
}