import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId") ?? undefined;
  const q = searchParams.get("q")?.trim() ?? undefined;

  const products = await prisma.product.findMany({
    where: {
      shopId,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: { shop: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}
