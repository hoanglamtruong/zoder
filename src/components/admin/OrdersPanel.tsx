"use client";

import { useEffect, useState } from "react";
import { formatVND } from "@/lib/format";

type OrderItem = {
  id: string;
  quantity: number;
  priceAtOrder: string;
  product: { name: string };
  shop: { name: string };
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
};

const STATUSES = ["pending", "confirmed", "shipped", "completed", "cancelled"];

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (loading) return <p className="text-neutral-500">Đang tải...</p>;
  if (orders.length === 0) return <p className="text-neutral-500">Chưa có đơn hàng.</p>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-sm text-neutral-500">{order.customerPhone} · {order.customerAddress}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold">{formatVND(Number(order.totalAmount))}</span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="rounded border border-neutral-300 px-2 py-1 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 border-t border-neutral-100 pt-3 space-y-1">
            {order.items.map((item) => (
              <p key={item.id} className="text-sm text-neutral-600">
                {item.product.name} ({item.shop.name}) × {item.quantity} — {formatVND(Number(item.priceAtOrder) * item.quantity)}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
