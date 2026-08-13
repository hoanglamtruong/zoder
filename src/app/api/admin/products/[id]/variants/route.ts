import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const variant = await prisma.productVariant.create({
      data: { productId: id, ...parsed.data },
    });
    return NextResponse.json(variant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "VARIANT_NAME_TAKEN" }, { status: 409 });
  }
}
