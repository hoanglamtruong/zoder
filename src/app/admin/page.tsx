"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  shops: number;
  products: number;
  orders: number;
  pendingOrders: number;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [shopsRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/shops"),
        fetch("/api/admin/products"),
        fetch("/api/admin/orders"),
      ]);
      const [shops, products, orders] = await Promise.all([
        shopsRes.json(),
        productsRes.json(),
        ordersRes.json(),
      ]);
      setStats({
        shops: shops.length,
        products: products.length,
        orders: orders.length,
        pendingOrders: orders.filter((o: { status: string }) => o.status === "pending").length,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Gian hàng", value: stats?.shops, href: "/admin/shops", icon: "🏬" },
    { label: "Sản phẩm", value: stats?.products, href: "/admin/products", icon: "📦" },
    { label: "Tổng đơn hàng", value: stats?.orders, href: "/admin/orders", icon: "🧾" },
    { label: "Đơn chờ xử lý", value: stats?.pendingOrders, href: "/admin/orders", icon: "⏳" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Tổng quan</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow"
          >
            <div className="text-2xl">{c.icon}</div>
            <p className="text-2xl font-extrabold mt-2">{c.value ?? "…"}</p>
            <p className="text-sm text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
