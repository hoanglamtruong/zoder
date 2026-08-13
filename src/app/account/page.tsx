"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatVND } from "@/lib/format";
import Badge, { type BadgeVariant } from "@/components/Badge";

type OrderItem = {
  id: string;
  quantity: number;
  priceAtOrder: string;
  product: { name: string };
  variant: { name: string } | null;
  shop: { name: string };
};

type Order = {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  items: OrderItem[];
};

type Profile = { id: string; name: string; phone: string; address: string | null };

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  shipped: "Đang giao",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [profileRes, ordersRes] = await Promise.all([
      fetch("/api/account/profile"),
      fetch("/api/account/orders"),
    ]);
    const profileData = await profileRes.json();
    setProfile(profileData);
    setName(profileData.name ?? "");
    setAddress(profileData.address ?? "");
    setOrders(await ordersRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavedMessage(null);
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address: address || undefined }),
    });
    if (res.ok) setSavedMessage("Đã lưu.");
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-neutral-500">Đang tải...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tài khoản của tôi</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
          Đăng xuất
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Thông tin cá nhân</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            disabled
            value={profile?.phone ?? ""}
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Họ và tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa chỉ mặc định</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
        </div>
        {savedMessage && <p className="text-sm text-emerald-600">{savedMessage}</p>}
        <button type="submit" className="rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark transition-colors">
          Lưu thay đổi
        </button>
      </form>

      <div>
        <h2 className="font-semibold mb-3">Lịch sử đơn hàng</h2>
        {orders.length === 0 ? (
          <p className="text-neutral-500">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Badge variant={order.status as BadgeVariant}>{STATUS_LABEL[order.status]}</Badge>
                  <span className="text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-neutral-600">
                      {item.product.name}
                      {item.variant && ` (${item.variant.name})`} × {item.quantity}
                    </p>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-neutral-100 text-right font-bold text-brand">
                  {formatVND(Number(order.totalAmount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
