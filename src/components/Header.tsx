"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { useEffect, useState } from "react";

export default function Header() {
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag for persisted zustand store
  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Zoder
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Trang chủ
          </Link>
          <Link href="/cart" className="relative hover:underline">
            Giỏ hàng
            {count > 0 && (
              <span className="absolute -right-4 -top-2 rounded-full bg-neutral-900 px-1.5 py-0.5 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
