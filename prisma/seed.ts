import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin@123", 12);
  let admin = await prisma.user.findUnique({ where: { email: "admin@company.com" } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@company.com",
        password: adminPassword,
        role: "ADMIN",
      },
    });
  }

  // Regular user
  const userPassword = await bcrypt.hash("user@123", 12);
  let user = await prisma.user.findUnique({ where: { email: "user@company.com" } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "user@company.com",
        password: userPassword,
        role: "USER",
      },
    });
  }

  // Only seed subscriptions if none exist
  const existing = await prisma.vendorSubscription.count();
  if (existing === 0) {
    const records = [
      {
        vendor: "Futurris Digital Pvt Ltd",
        department: "Technology",
        useFor: "Design Vendor",
        servicesProviding: "UX design for Platform",
        nature: "Platform design services",
        subscriptionAmount: 100000,
        subscriptionType: "ANNUAL",
        paidOneTime: false,
        date: new Date("2027-05-27"),
        renewalDate: new Date("2028-05-27"),
        createdById: admin.id,
        updatedByName: admin.name,
      },
      {
        vendor: "NSE Indices Limited",
        department: "Technology",
        useFor: "Tech Platform",
        servicesProviding: "Market Data for platform",
        nature: "Data subscription of NSE equity",
        subscriptionAmount: 25000,
        subscriptionType: "MONTHLY",
        paidOneTime: false,
        date: new Date("2027-06-15"),
        renewalDate: new Date("2028-06-15"),
        createdById: admin.id,
        updatedByName: admin.name,
      },
      {
        vendor: "AWS India",
        department: "Technology",
        useFor: "Cloud Infrastructure",
        servicesProviding: "Cloud hosting and compute",
        nature: "Cloud services",
        subscriptionAmount: 50000,
        subscriptionType: "MONTHLY",
        paidOneTime: false,
        date: new Date("2027-01-01"),
        renewalDate: new Date("2027-12-31"),
        createdById: user.id,
        updatedByName: user.name,
      },
      {
        vendor: "Adobe Systems",
        department: "Design",
        useFor: "Design Tools",
        servicesProviding: "Creative Cloud licenses",
        nature: "Design software",
        subscriptionAmount: 75000,
        subscriptionType: "ANNUAL",
        paidOneTime: false,
        date: new Date("2027-04-01"),
        renewalDate: new Date("2028-04-01"),
        createdById: user.id,
        updatedByName: user.name,
      },
      {
        vendor: "Zoom Video Communications",
        department: "HR",
        useFor: "Video Conferencing",
        servicesProviding: "Team video calls",
        nature: "Communication tool",
        subscriptionAmount: 15000,
        subscriptionType: "ANNUAL",
        paidOneTime: false,
        date: new Date("2027-03-01"),
        renewalDate: new Date("2028-03-01"),
        createdById: admin.id,
        updatedByName: admin.name,
      },
    ];

    for (const rec of records) {
      await prisma.vendorSubscription.create({ data: rec });
    }
  }

  console.log("✅ Seed complete!");
  console.log("  Admin: admin@company.com / admin@123");
  console.log("  User:  user@company.com  / user@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
