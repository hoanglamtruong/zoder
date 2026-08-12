"use client";

import { useState } from "react";
import ShopsPanel from "@/components/admin/ShopsPanel";
import ProductsPanel from "@/components/admin/ProductsPanel";
import OrdersPanel from "@/components/admin/OrdersPanel";

const TABS = [
  { id: "shops", label: "Gian hàng" },
  { id: "products", label: "Sản phẩm" },
  { id: "orders", label: "Đơn hàng" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<TabId>("shops");

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "shops" && <ShopsPanel />}
      {tab === "products" && <ProductsPanel />}
      {tab === "orders" && <OrdersPanel />}
    </div>
  );
}
