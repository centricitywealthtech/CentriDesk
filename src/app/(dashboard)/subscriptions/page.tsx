import { SubscriptionTable } from "@/components/subscriptions/SubscriptionTable";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vendor Expenses</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Manage all vendor expense records
        </p>
      </div>
      <SubscriptionTable />
    </div>
  );
}
