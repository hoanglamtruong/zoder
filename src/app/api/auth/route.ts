import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  signCustomerToken,
  setCustomerSessionCookie,
  clearCustomerSessionCookie,
  getCustomerSession,
} from "@/lib/customer-auth";

const loginSchema = z.object({
  phone: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const { phone, password } = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { phone } });
  if (!customer) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const token = await signCustomerToken({ customerId: customer.id, phone: customer.phone, name: customer.name });
  await setCustomerSessionCookie(token);

  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone });
}

export async function DELETE() {
  await clearCustomerSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json(session);
}
