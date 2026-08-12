"use client";

import { useEffect, useState } from "react";
import { formatVND } from "@/lib/format";

type Shop = { id: string; name: string };
type Product = {
  id: string;
  shopId: string;
  shop: Shop;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
};

const emptyForm = { shopId: "", name: "", slug: "", description: "", price: "", stock: "" };

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [productsRes, shopsRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/shops"),
    ]);
    setProducts(await productsRes.json());
    setShops(await shopsRes.json());
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
      shopId: form.shopId,
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock || 0),
    };
    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Lưu sản phẩm thất bại");
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa sản phẩm này?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      shopId: product.shopId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-3 rounded-xl border border-neutral-200 bg-white p-5 h-fit">
        <h3 className="font-semibold">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <select
          required
          value={form.shopId}
          onChange={(e) => setForm({ ...form, shopId: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">-- Chọn gian hàng --</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Tên sản phẩm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          required
          placeholder="Slug (vd: san-pham-abc)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          rows={2}
        />
        <input
          required
          type="number"
          min={0}
          step="1000"
          placeholder="Giá (VNĐ)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          required
          type="number"
          min={0}
          placeholder="Tồn kho"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
        />
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
        ) : products.length === 0 ? (
          <p className="text-neutral-500">Chưa có sản phẩm.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="rounded-xl border border-neutral-200 bg-white p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-neutral-500">
                  {product.shop.name} · {formatVND(Number(product.price))} · tồn {product.stock}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button onClick={() => startEdit(product)} className="text-neutral-700 hover:underline">
                  Sửa
                </button>
                <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">
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
