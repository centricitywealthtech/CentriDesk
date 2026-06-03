import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.softwareRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rows);
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

  const row = await prisma.softwareRequest.create({
    data: {
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
    },
  });

  // Notify all admin users
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
  if (admins.length > 0) {
    await prisma.iTRequestNotification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        softwareRequestId: row.id,
        message: `New IT request: "${softwareName}" from ${requestedBy}`,
      })),
    });
  }

  return NextResponse.json(row, { status: 201 });
}
