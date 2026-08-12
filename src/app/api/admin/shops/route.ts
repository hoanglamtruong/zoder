import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const shopSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function GET() {
  const shops = await prisma.shop.findMany({
    include: { category: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(shops);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = shopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const shop = await prisma.shop.create({ data: parsed.data });
  return NextResponse.json(shop, { status: 201 });
}
