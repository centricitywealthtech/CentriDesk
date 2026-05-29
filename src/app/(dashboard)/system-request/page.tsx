import { FormsLibrary } from "@/components/forms/FormsLibrary";

export default function SystemRequestPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Forms Library</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Upload and share system request forms
        </p>
      </div>
      <FormsLibrary />
    </div>
  );
}
