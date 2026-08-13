"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string };
type Shop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string | null;
  category: Category | null;
  _count: { products: number };
};

const emptyForm = { name: "", slug: "", description: "", categoryId: "" };

export default function ShopsPanel() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [shopsRes, categoriesRes] = await Promise.all([
      fetch("/api/admin/shops"),
      fetch("/api/categories"),
    ]);
    setShops(await shopsRes.json());
    setCategories(await categoriesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      categoryId: form.categoryId || undefined,
    };
    const url = editingId ? `/api/admin/shops/${editingId}` : "/api/admin/shops";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Lưu gian hàng thất bại");
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa gian hàng này?")) return;
    await fetch(`/api/admin/shops/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(shop: Shop) {
    setEditingId(shop.id);
    setForm({
      name: shop.name,
      slug: shop.slug,
      description: shop.description ?? "",
      categoryId: shop.categoryId ?? "",
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-3 rounded-xl border border-neutral-200 bg-white p-5 h-fit">
        <h3 className="font-semibold">{editingId ? "Sửa gian hàng" : "Thêm gian hàng"}</h3>
        <input
          required
          placeholder="Tên gian hàng"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <input
          required
          placeholder="Slug (vd: shop-abc)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          rows={3}
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        >
          <option value="">-- Không danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-brand text-white px-4 py-2 text-sm font-medium hover:bg-brand-dark transition-colors">
            {editingId ? "Cập nhật" : "Tạo mới"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white overflow-hidden">
        {loading ? (
          <p className="text-neutral-500 p-5">Đang tải...</p>
        ) : shops.length === 0 ? (
          <p className="text-neutral-500 p-5">Chưa có gian hàng.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                <th className="px-4 py-3 font-medium">Tên</th>
                <th className="px-4 py-3 font-medium">Danh mục</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-neutral-400 text-xs">/{shop.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{shop.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-neutral-600">{shop._count.products}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => startEdit(shop)} className="text-brand hover:underline">
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(shop.id)} className="text-red-500 hover:underline">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
