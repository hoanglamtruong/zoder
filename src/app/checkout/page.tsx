"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatVND } from "@/lib/format";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag for persisted zustand store
  useEffect(() => setMounted(true), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Đặt hàng thất bại");
      }
      const order = await res.json();
      setOrderId(order.id);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-neutral-500">
          Mã đơn hàng: <span className="font-mono text-neutral-700">{orderId}</span>
        </p>
        <p className="text-neutral-500 mt-2">
          Chúng tôi sẽ liên hệ bạn để xác nhận (thanh toán COD / thoả thuận).
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-neutral-500">
        Giỏ hàng trống. Không thể thanh toán.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Thanh toán</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <form id="checkout-form" onSubmit={handleSubmit} className="md:col-span-2 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <h2 className="font-semibold">Thông tin nhận hàng</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Họ và tên</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số điện thoại</label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Địa chỉ</label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                rows={3}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:hidden rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : `Đặt hàng · ${formatVND(total)}`}
          </button>
        </form>

        <div className="md:col-span-1">
          <div className="sticky top-24 rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
            <h2 className="font-semibold">Đơn hàng</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-neutral-600 line-clamp-1 pr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-extrabold text-brand">{formatVND(total)}</span>
            </div>
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="hidden md:block w-full rounded-lg bg-brand px-6 py-3 text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
