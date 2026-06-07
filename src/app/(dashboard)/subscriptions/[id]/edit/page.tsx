import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { VendorSubscription } from "@/lib/models/VendorSubscription";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { format } from "date-fns";

export default async function EditSubscriptionPage({ params }: { params: { id: string } }) {
  await connectDB();
  const record = await VendorSubscription.findById(params.id).lean();
  if (!record) notFound();

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit Subscription</h1>
        <p className="text-gray-500 text-sm mt-0.5">Update the vendor subscription record</p>
      </div>
      <SubscriptionForm
        editId={(record._id as { toString(): string }).toString()}
        initialData={{
          vendor: record.vendor,
          department: record.department,
          useFor: record.useFor,
          servicesProviding: record.servicesProviding,
          nature: record.nature,
          subscriptionAmount: String(record.subscriptionAmount),
          subscriptionType: record.subscriptionType,
          date: record.date ? format(new Date(record.date), "yyyy-MM-dd") : "",
          renewalDate: record.renewalDate ? format(new Date(record.renewalDate), "yyyy-MM-dd") : "",
          requestedBy: record.requestedBy ?? "",
          approvedBy: record.approvedBy ?? "",
          relation: record.relation ?? "",
        }}
      />
    </div>
  );
}
