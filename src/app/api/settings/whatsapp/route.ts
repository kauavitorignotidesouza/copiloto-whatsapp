import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  const [tenant] = await db
    .select({
      whatsappPhoneNumberId: tenants.whatsappPhoneNumberId,
      whatsappBusinessAccountId: tenants.whatsappBusinessAccountId,
      whatsappAccessToken: tenants.whatsappAccessToken,
    })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
  }

  const hasAccessToken = Boolean(tenant.whatsappAccessToken?.trim());
  const accessTokenMasked = hasAccessToken && tenant.whatsappAccessToken
    ? `${tenant.whatsappAccessToken.slice(0, 6)}••••••${tenant.whatsappAccessToken.slice(-4)}`
    : "";

  return NextResponse.json({
    whatsappPhoneNumberId: tenant.whatsappPhoneNumberId ?? "",
    whatsappBusinessAccountId: tenant.whatsappBusinessAccountId ?? "",
    hasAccessToken,
    accessTokenMasked,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tenantId = (session.user as unknown as { tenantId?: string }).tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "Tenant não encontrado" }, { status: 403 });
  }

  let body: {
    whatsappPhoneNumberId?: string;
    whatsappBusinessAccountId?: string;
    whatsappAccessToken?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const updates: {
    whatsappPhoneNumberId?: string | null;
    whatsappBusinessAccountId?: string | null;
    whatsappAccessToken?: string | null;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (body.whatsappPhoneNumberId !== undefined) {
    updates.whatsappPhoneNumberId = body.whatsappPhoneNumberId?.trim() || null;
  }
  if (body.whatsappBusinessAccountId !== undefined) {
    updates.whatsappBusinessAccountId = body.whatsappBusinessAccountId?.trim() || null;
  }
  if (body.whatsappAccessToken !== undefined) {
    updates.whatsappAccessToken = body.whatsappAccessToken?.trim() || null;
  }

  await db.update(tenants).set(updates).where(eq(tenants.id, tenantId));

  return NextResponse.json({ success: true });
}
