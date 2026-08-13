"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type Category = { id: string; name: string; slug: string };

export default function Header() {
  const items = useCartStore((s) => s.items);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe mount flag for persisted zustand store
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const count = mounted ? items.reduce((sum, i) => sum + i.quantity, 0) : 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-brand to-brand-dark text-white shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
        <Link href="/" className="text-2xl font-extrabold tracking-tight shrink-0">
          Zoder
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="flex items-center bg-white rounded-md overflow-hidden">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm, thương hiệu..."
              className="flex-1 px-4 py-2 text-sm text-neutral-900 outline-none"
            />
            <button
              type="submit"
              className="bg-brand-dark hover:bg-brand px-4 py-2 text-white transition-colors"
              aria-label="Tìm kiếm"
            >
              🔍
            </button>
          </div>
        </form>

        <nav className="flex items-center gap-5 text-sm shrink-0">
          <Link href="/" className="hover:opacity-80">
            Trang chủ
          </Link>
          <Link href="/cart" className="relative hover:opacity-80">
            🛒 Giỏ hàng
            {count > 0 && (
              <span className="absolute -right-3 -top-2 rounded-full bg-white text-brand-dark px-1.5 py-0.5 text-xs font-bold leading-none">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {categories.length > 0 && (
        <div className="border-t border-white/20">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar text-sm">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="whitespace-nowrap hover:underline opacity-90 hover:opacity-100"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
