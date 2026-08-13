import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-auth";

const profileSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
});

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const customer = await prisma.customer.findUnique({ where: { id: session.customerId } });
  if (!customer) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone, address: customer.address });
}

export async function PUT(request: Request) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const customer = await prisma.customer.update({
    where: { id: session.customerId },
    data: parsed.data,
  });
  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone, address: customer.address });
}
