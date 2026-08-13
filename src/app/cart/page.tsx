"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";
import PlaceholderThumb from "@/components/PlaceholderThumb";
import QuantityStepper from "@/components/QuantityStepper";

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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Giỏ hàng ({items.reduce((s, i) => s + i.quantity, 0)})</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-xl border border-dashed border-neutral-300 bg-white">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-neutral-500">Giỏ hàng đang trống.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2 text-white font-medium hover:bg-brand-dark transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(byShop).map(([shopId, group]) => (
            <div key={shopId} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="bg-neutral-50 px-5 py-3 font-semibold text-sm border-b border-neutral-200">
                🏬 {group.shopName}
              </div>
              <div className="divide-y divide-neutral-100">
                {group.items.map((item) => (
                  <div key={item.lineId} className="flex items-center gap-4 p-4">
                    <PlaceholderThumb label={item.name} className="h-16 w-16 rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`} className="font-medium hover:text-brand line-clamp-1">
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-neutral-400 mt-0.5">Phân loại: {item.variantName}</p>
                      )}
                      <p className="text-sm text-brand font-semibold mt-1">{formatVND(item.price)}</p>
                    </div>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(item.lineId, q)}
                    />
                    <p className="w-28 text-right font-semibold hidden sm:block">
                      {formatVND(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.lineId)}
                      className="text-neutral-400 hover:text-red-500 transition-colors"
                      aria-label="Xóa"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky bottom-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-lg flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Tổng cộng</p>
              <p className="text-2xl font-extrabold text-brand">{formatVND(total)}</p>
            </div>
            <Link
              href="/checkout"
              className="rounded-lg bg-brand px-8 py-3 text-white font-semibold hover:bg-brand-dark transition-colors"
            >
              Thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
