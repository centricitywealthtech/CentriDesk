import { FormTrackingTable } from "@/components/forms/FormTracking";

export default function TrackingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Form Tracking</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Track shared forms and update their approval status
        </p>
      </div>
      <FormTrackingTable />
    </div>
  );
}
