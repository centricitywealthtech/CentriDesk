import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";

export default function NewSubscriptionPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Add Subscription</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Add a new vendor subscription record
        </p>
      </div>
      <SubscriptionForm />
    </div>
  );
}
