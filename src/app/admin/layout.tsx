"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: "📊" },
  { href: "/admin/shops", label: "Gian hàng", icon: "🏬" },
  { href: "/admin/products", label: "Sản phẩm", icon: "📦" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "🧾" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-neutral-100">
      <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        <div className="px-5 py-5 border-b border-neutral-200">
          <p className="font-extrabold text-brand text-lg">Zoder Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-neutral-200 space-y-1">
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100">
            ← Xem trang khách
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
