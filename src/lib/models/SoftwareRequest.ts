import mongoose, { Schema, Document } from "mongoose";

export interface ISoftwareRequest extends Document {
  id: string;
  requestedBy: string;
  employeeId: string;
  department: string;
  designation: string;
  emailId: string;
  requestDate: string;
  softwareName: string;
  softwareVersion: string;
  vendorName: string;
  softwareCategory: string;
  licenseType: string;
  licensesRequired: string;
  installationOn: string;
  purposeOfInstallation: string;
  businessImpact: string;
  policyPreparedBy: string;
  policyReviewedBy: string;
  policyApprovedBy: string;
  policyEffectiveDate: string;
  versionControl: string;
  techCompatibility: string;
  techAntivirusScan: string;
  techLicenseVerif: string;
  techVendorValidation: string;
  techAdminRights: string;
  techRemarks: string;
  secDlpCompliance: string;
  secRiskAssessment: string;
  secApprovalStatus: string;
  secRemarks: string;
  approvalMatrix: string;
  instCompletedBy: string;
  instDate: string;
  instSoftwareInstalled: string;
  instLicenseUpdated: string;
  instAssetUpdated: string;
  instRemarks: string;
  ackEmployeeName: string;
  ackSignatureDate: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

const str = (def = "") => ({ type: String, default: def });

const SoftwareRequestSchema = new Schema<ISoftwareRequest>(
  {
    requestedBy: { type: String, required: true },
    employeeId: str(),
    department: str(),
    designation: str(),
    emailId: { type: String, required: true },
    requestDate: str(),
    softwareName: { type: String, required: true },
    softwareVersion: str(),
    vendorName: str(),
    softwareCategory: str(),
    licenseType: str(),
    licensesRequired: str(),
    installationOn: str(),
    purposeOfInstallation: str(),
    businessImpact: str(),
    policyPreparedBy: str(),
    policyReviewedBy: str(),
    policyApprovedBy: str(),
    policyEffectiveDate: str(),
    versionControl: str(),
    techCompatibility: str(),
    techAntivirusScan: str(),
    techLicenseVerif: str(),
    techVendorValidation: str(),
    techAdminRights: str(),
    techRemarks: str(),
    secDlpCompliance: str(),
    secRiskAssessment: str(),
    secApprovalStatus: str(),
    secRemarks: str(),
    approvalMatrix: str(),
    instCompletedBy: str(),
    instDate: str(),
    instSoftwareInstalled: str(),
    instLicenseUpdated: str(),
    instAssetUpdated: str(),
    instRemarks: str(),
    ackEmployeeName: str(),
    ackSignatureDate: str(),
    state: str("Submitted"),
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const SoftwareRequest =
  (mongoose.models.SoftwareRequest as mongoose.Model<ISoftwareRequest>) ||
  mongoose.model<ISoftwareRequest>("SoftwareRequest", SoftwareRequestSchema);
