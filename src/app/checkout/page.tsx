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
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-3">Đặt hàng thành công!</h1>
        <p className="text-neutral-600">Mã đơn hàng: {orderId}</p>
        <p className="text-neutral-500 mt-2">Chúng tôi sẽ liên hệ bạn để xác nhận (thanh toán COD / thoả thuận).</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-neutral-500">
        Giỏ hàng trống. Không thể thanh toán.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Họ và tên</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            rows={3}
          />
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 flex items-center justify-between">
          <span className="font-medium">Tổng cộng</span>
          <span className="text-lg font-bold">{formatVND(total)}</span>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </form>
    </div>
  );
}
