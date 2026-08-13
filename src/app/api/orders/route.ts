import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerAddress: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1).optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { customerName, customerPhone, customerAddress, items } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { variants: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let totalAmount = 0;
      const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) throw new Error("VARIANT_NOT_FOUND");
          if (variant.stock < item.quantity) {
            throw new Error(`OUT_OF_STOCK:${product.name} (${variant.name})`);
          }
          const price = Number(variant.price);
          totalAmount += price * item.quantity;
          return {
            productId: product.id,
            variantId: variant.id,
            shopId: product.shopId,
            quantity: item.quantity,
            priceAtOrder: price,
          };
        }

        if (product.variants.length > 0) {
          throw new Error(`VARIANT_REQUIRED:${product.name}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${product.name}`);
        }
        const price = Number(product.price);
        totalAmount += price * item.quantity;
        return {
          productId: product.id,
          variantId: null,
          shopId: product.shopId,
          quantity: item.quantity,
          priceAtOrder: price,
        };
      });

      const createdOrder = await tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerAddress,
          totalAmount,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      for (const item of orderItemsData) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return createdOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ORDER_FAILED";
    if (message.startsWith("OUT_OF_STOCK") || message.startsWith("VARIANT_REQUIRED")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (message === "PRODUCT_NOT_FOUND" || message === "VARIANT_NOT_FOUND") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    return NextResponse.json({ error: "ORDER_FAILED" }, { status: 500 });
  }
}
