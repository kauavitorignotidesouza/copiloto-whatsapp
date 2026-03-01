import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants, users } from "@/lib/db/schema";
import { slugify } from "@/lib/utils/slug";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const emailNorm = (email as string).trim().toLowerCase();

    const [existingUser] = await db.select().from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existingUser) {
      return NextResponse.json({ error: "Este email já está em uso." }, { status: 400 });
    }

    const baseSlug = slugify(companyName as string) || "empresa";
    let slug = baseSlug;
    let suffix = 0;

    while (true) {
      const [existing] = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const tenantId = createId();
    const userId = createId();
    const passwordHash = await hash(password, 10);

    await db.insert(tenants).values({
      id: tenantId,
      name: (companyName as string).trim(),
      slug,
    });

    await db.insert(users).values({
      id: userId,
      tenantId,
      name: (name as string).trim(),
      email: emailNorm,
      passwordHash,
      role: "admin",
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso. Faça login." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Este email já está em uso." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}
