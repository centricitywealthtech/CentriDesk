import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { connectDB } from "@/lib/db";
import { SoftwareRequest } from "@/lib/models/SoftwareRequest";
import { ITRequestNotification } from "@/lib/models/ITRequestNotification";
import { User } from "@/lib/models/User";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const rows = await SoftwareRequest.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows.map((r) => ({ ...r, id: (r._id as { toString(): string }).toString() })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    requestedBy, employeeId, department, designation, emailId, requestDate,
    softwareName, softwareVersion, vendorName, softwareCategory,
    licenseType, licensesRequired, installationOn,
    purposeOfInstallation, businessImpact,
    policyPreparedBy, policyReviewedBy, policyApprovedBy, policyEffectiveDate,
    versionControl,
    techCompatibility, techAntivirusScan, techLicenseVerif, techVendorValidation,
    techAdminRights, techRemarks,
    secDlpCompliance, secRiskAssessment, secApprovalStatus, secRemarks,
    approvalMatrix,
    instCompletedBy, instDate, instSoftwareInstalled, instLicenseUpdated, instAssetUpdated, instRemarks,
    ackEmployeeName, ackSignatureDate,
  } = body;

  if (!requestedBy || !emailId || !softwareName) {
    return NextResponse.json({ error: "Requested By, Email and Software Name are required." }, { status: 400 });
  }

  await connectDB();
  const row = await SoftwareRequest.create({
    requestedBy, employeeId: employeeId ?? "", department: department ?? "",
    designation: designation ?? "", emailId,
    requestDate: requestDate ?? new Date().toISOString().split("T")[0],
    softwareName, softwareVersion: softwareVersion ?? "",
    vendorName: vendorName ?? "", softwareCategory: softwareCategory ?? "",
    licenseType: licenseType ?? "", licensesRequired: licensesRequired ?? "",
    installationOn: installationOn ?? "",
    purposeOfInstallation: purposeOfInstallation ?? "",
    businessImpact: businessImpact ?? "",
    policyPreparedBy: policyPreparedBy ?? "",
    policyReviewedBy: policyReviewedBy ?? "",
    policyApprovedBy: policyApprovedBy ?? "",
    policyEffectiveDate: policyEffectiveDate ?? "",
    versionControl: versionControl ? JSON.stringify(versionControl) : "",
    techCompatibility: techCompatibility ?? "",
    techAntivirusScan: techAntivirusScan ?? "",
    techLicenseVerif: techLicenseVerif ?? "",
    techVendorValidation: techVendorValidation ?? "",
    techAdminRights: techAdminRights ?? "",
    techRemarks: techRemarks ?? "",
    secDlpCompliance: secDlpCompliance ?? "",
    secRiskAssessment: secRiskAssessment ?? "",
    secApprovalStatus: secApprovalStatus ?? "",
    secRemarks: secRemarks ?? "",
    approvalMatrix: approvalMatrix ? JSON.stringify(approvalMatrix) : "",
    instCompletedBy: instCompletedBy ?? "",
    instDate: instDate ?? "",
    instSoftwareInstalled: instSoftwareInstalled ?? "",
    instLicenseUpdated: instLicenseUpdated ?? "",
    instAssetUpdated: instAssetUpdated ?? "",
    instRemarks: instRemarks ?? "",
    ackEmployeeName: ackEmployeeName ?? "",
    ackSignatureDate: ackSignatureDate ?? "",
  });

  const admins = await User.find({ role: "ADMIN", isActive: true }).select("_id").lean();
  if (admins.length > 0) {
    await ITRequestNotification.insertMany(
      admins.map((a: { _id: unknown }) => ({
        userId: a._id,
        softwareRequestId: row._id,
        message: `New IT request: "${softwareName}" from ${requestedBy}`,
      }))
    );
  }

  return NextResponse.json({ ...row.toJSON(), id: row._id.toString() }, { status: 201 });
}
