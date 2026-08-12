"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag for persisted zustand store
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const byShop = items.reduce<Record<string, { shopName: string; items: typeof items }>>(
    (acc, item) => {
      if (!acc[item.shopId]) acc[item.shopId] = { shopName: item.shopName, items: [] };
      acc[item.shopId].items.push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p>Giỏ hàng đang trống.</p>
          <Link href="/" className="mt-4 inline-block text-neutral-900 underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byShop).map(([shopId, group]) => (
            <div key={shopId} className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="font-semibold mb-3">{group.shopName}</h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/products/${item.slug}`} className="hover:underline">
                        {item.name}
                      </Link>
                      <p className="text-sm text-neutral-500">{formatVND(item.price)}</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                      className="w-16 rounded border border-neutral-300 px-2 py-1 text-center"
                    />
                    <p className="w-28 text-right font-medium">{formatVND(item.price * item.quantity)}</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-5">
            <p className="text-lg font-semibold">Tổng cộng</p>
            <p className="text-xl font-bold">{formatVND(total)}</p>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-lg bg-neutral-900 px-6 py-3 text-center text-white hover:bg-neutral-700 transition-colors"
          >
            Tiến hành thanh toán
          </Link>
        </div>
      )}
    </div>
  );
}
