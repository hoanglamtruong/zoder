import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true, variant: true, shop: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
