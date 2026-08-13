import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, setCustomerSessionCookie } from "@/lib/customer-auth";

const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, phone, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "PHONE_TAKEN" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({
    data: { name, phone, passwordHash },
  });

  const token = await signCustomerToken({ customerId: customer.id, phone: customer.phone, name: customer.name });
  await setCustomerSessionCookie(token);

  return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone }, { status: 201 });
}
