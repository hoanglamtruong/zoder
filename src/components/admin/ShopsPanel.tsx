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
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Slug (vd: shop-abc)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          rows={3}
        />
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
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
          <button type="submit" className="rounded bg-neutral-900 text-white px-4 py-2 text-sm">
            {editingId ? "Cập nhật" : "Tạo mới"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded border border-neutral-300 px-4 py-2 text-sm"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {loading ? (
          <p className="text-neutral-500">Đang tải...</p>
        ) : shops.length === 0 ? (
          <p className="text-neutral-500">Chưa có gian hàng.</p>
        ) : (
          shops.map((shop) => (
            <div key={shop.id} className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{shop.name}</p>
                <p className="text-sm text-neutral-500">
                  /{shop.slug} · {shop._count.products} sản phẩm
                  {shop.category ? ` · ${shop.category.name}` : ""}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(shop)} className="text-neutral-700 hover:underline">
                  Sửa
                </button>
                <button onClick={() => handleDelete(shop.id)} className="text-red-500 hover:underline">
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
