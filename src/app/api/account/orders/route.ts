import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    include: { items: { include: { product: true, variant: true, shop: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
