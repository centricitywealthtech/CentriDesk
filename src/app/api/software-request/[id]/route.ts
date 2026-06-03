import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    instCompletedBy, instDate, instSoftwareInstalled, instLicenseUpdated,
    instAssetUpdated, instRemarks,
    ackEmployeeName, ackSignatureDate,
    state,
  } = body;

  const row = await prisma.softwareRequest.update({
    where: { id: params.id },
    data: {
      requestedBy, employeeId, department, designation, emailId, requestDate,
      softwareName, softwareVersion, vendorName, softwareCategory,
      licenseType, licensesRequired, installationOn,
      purposeOfInstallation, businessImpact,
      policyPreparedBy, policyReviewedBy, policyApprovedBy, policyEffectiveDate,
      versionControl: versionControl ? JSON.stringify(versionControl) : undefined,
      techCompatibility, techAntivirusScan, techLicenseVerif, techVendorValidation,
      techAdminRights, techRemarks,
      secDlpCompliance, secRiskAssessment, secApprovalStatus, secRemarks,
      approvalMatrix: approvalMatrix ? JSON.stringify(approvalMatrix) : undefined,
      instCompletedBy, instDate, instSoftwareInstalled, instLicenseUpdated,
      instAssetUpdated, instRemarks,
      ackEmployeeName, ackSignatureDate,
      state,
    },
  });

  return NextResponse.json(row);
}
