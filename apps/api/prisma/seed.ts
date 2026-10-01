# Prisma seed script
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      id: "tenant_demo",
      name: "Demo Es Teh",
      slug: "demo",
      settings: {},
    },
  });

  const outlet = await prisma.outlet.upsert({
    where: { code: "DEMO01" },
    update: {},
    create: {
      id: "outlet_demo_01",
      tenantId: tenant.id,
      code: "DEMO01",
      name: "Demo Outlet 01",
      address: "Jl. Contoh No. 1",
      phone: "08123456789",
    },
  });

  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: "admin" } },
    update: {},
    create: {
      id: "user_admin",
      tenantId: tenant.id,
      outletId: outlet.id,
      username: "admin",
      passwordHash: adminPassword,
      fullName: "Administrator",
      role: "ADMIN",
    },
  });

  const financePassword = await bcrypt.hash("finance123", 10);

  await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: "finance" } },
    update: {},
    create: {
      id: "user_finance",
      tenantId: tenant.id,
      outletId: outlet.id,
      username: "finance",
      passwordHash: financePassword,
      fullName: "Staf Keuangan",
      role: "FINANCE",
    },
  });

  const cashierPassword = await bcrypt.hash("kasir123", 10);

  await prisma.user.upsert({
    where: { tenantId_username: { tenantId: tenant.id, username: "kasir" } },
    update: {},
    create: {
      id: "user_kasir",
      tenantId: tenant.id,
      outletId: outlet.id,
      username: "kasir",
      passwordHash: cashierPassword,
      fullName: "Kasir",
      role: "CASHIER",
    },
  });

  // Create accounting periods
  const now = new Date();
  await prisma.accountingPeriod.upsert({
    where: { tenantId_year_month: { tenantId: tenant.id, year: now.getFullYear(), month: now.getMonth() + 1 } },
    update: {},
    create: {
      id: `period_${now.getFullYear()}_${now.getMonth() + 1}`,
      tenantId: tenant.id,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      status: "OPEN",
    },
  });

  console.log("✅ Seed selesai");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
