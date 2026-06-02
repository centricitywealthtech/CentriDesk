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
    },
  });

  return NextResponse.json(row, { status: 201 });
}
