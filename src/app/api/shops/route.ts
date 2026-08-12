import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shops = await prisma.shop.findMany({
    include: { category: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(shops);
}
