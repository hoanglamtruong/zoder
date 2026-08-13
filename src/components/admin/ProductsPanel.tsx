"use client";

import { Fragment, useEffect, useState } from "react";
import { formatVND } from "@/lib/format";
import Badge from "@/components/Badge";
import ProductVariantsEditor from "@/components/admin/ProductVariantsEditor";

type Shop = { id: string; name: string };
type Variant = { id: string; name: string; price: string; stock: number };
type Product = {
  id: string;
  shopId: string;
  shop: Shop;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  variants: Variant[];
};

const emptyForm = { shopId: "", name: "", slug: "", description: "", price: "", stock: "" };
type DraftVariant = { name: string; price: string; stock: string };
const emptyDraftVariant: DraftVariant = { name: "", price: "", stock: "" };

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

    if (!editingId) {
      const created = await res.json();
      const validVariants = draftVariants.filter((v) => v.name.trim() && Number(v.price) > 0);
      for (const v of validVariants) {
        const variantRes = await fetch(`/api/admin/products/${created.id}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: v.name,
            price: Number(v.price),
            stock: Number(v.stock || 0),
          }),
        });
        if (!variantRes.ok) {
          setError(`Đã tạo sản phẩm nhưng biến thể "${v.name}" bị lỗi (tên trùng?)`);
        }
      }
    }

    setForm(emptyForm);
    setDraftVariants([]);
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
    setDraftVariants([]);
    setForm({
      shopId: product.shopId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      stock: String(product.stock),
    });
  }

  function updateDraftVariant(index: number, patch: Partial<DraftVariant>) {
    setDraftVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeDraftVariant(index: number) {
    setDraftVariants((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-3 rounded-xl border border-neutral-200 bg-white p-5 h-fit">
        <h3 className="font-semibold">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
        <select
          required
          value={form.shopId}
          onChange={(e) => setForm({ ...form, shopId: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
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
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <input
          required
          placeholder="Slug (vd: san-pham-abc)"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />
        <textarea
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          rows={2}
        />
        <div>
          <input
            required
            type="number"
            min={0}
            step="1000"
            placeholder="Giá mặc định (VNĐ)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
          />
          <p className="text-xs text-neutral-400 mt-1">
            Dùng khi sản phẩm không có biến thể. Nếu có biến thể, giá từng biến thể sẽ được ưu tiên.
          </p>
        </div>
        <input
          required
          type="number"
          min={0}
          placeholder="Tồn kho mặc định"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none"
        />

        {!editingId && (
          <div className="border-t border-neutral-200 pt-3 space-y-2">
            <p className="text-sm font-medium">Biến thể (tùy chọn)</p>
            <p className="text-xs text-neutral-400">
              Vd: Size S / Size M / Size L, mỗi biến thể có giá và tồn kho riêng.
            </p>
            {draftVariants.map((v, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  placeholder="Tên (vd: Size M)"
                  value={v.name}
                  onChange={(e) => updateDraftVariant(i, { name: e.target.value })}
                  className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step="1000"
                  placeholder="Giá"
                  value={v.price}
                  onChange={(e) => updateDraftVariant(i, { price: e.target.value })}
                  className="w-20 rounded border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Kho"
                  value={v.stock}
                  onChange={(e) => updateDraftVariant(i, { stock: e.target.value })}
                  className="w-16 rounded border border-neutral-300 px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeDraftVariant(i)}
                  className="text-red-500 text-sm px-1"
                  aria-label="Xóa dòng"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDraftVariants((prev) => [...prev, { ...emptyDraftVariant }])}
              className="text-sm text-brand hover:underline"
            >
              + Thêm dòng biến thể
            </button>
          </div>
        )}

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
                setDraftVariants([]);
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
        ) : products.length === 0 ? (
          <p className="text-neutral-500 p-5">Chưa có sản phẩm.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-neutral-500 border-b border-neutral-200">
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Gian hàng</th>
                <th className="px-4 py-3 font-medium">Giá</th>
                <th className="px-4 py-3 font-medium">Tồn kho</th>
                <th className="px-4 py-3 font-medium">Biến thể</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((product) => {
                const hasVariants = product.variants.length > 0;
                const stock = hasVariants
                  ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                  : product.stock;
                const expanded = expandedId === product.id;

                return (
                  <Fragment key={product.id}>
                    <tr className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-neutral-600">{product.shop.name}</td>
                      <td className="px-4 py-3 text-brand font-semibold">
                        {hasVariants ? (
                          <>
                            {formatVND(Math.min(...product.variants.map((v) => Number(v.price))))}
                            {" – "}
                            {formatVND(Math.max(...product.variants.map((v) => Number(v.price))))}
                          </>
                        ) : (
                          formatVND(Number(product.price))
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stock === 0 ? (
                          <Badge variant="out">Hết hàng</Badge>
                        ) : stock <= 5 ? (
                          <Badge variant="low">{stock} còn lại</Badge>
                        ) : (
                          <span className="text-neutral-600">{stock}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(expanded ? null : product.id)}
                          className="text-brand hover:underline"
                        >
                          {hasVariants ? `${product.variants.length} loại` : "Thêm biến thể"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => startEdit(product)} className="text-brand hover:underline">
                          Sửa
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">
                          Xóa
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3">
                          <ProductVariantsEditor
                            productId={product.id}
                            variants={product.variants}
                            onChanged={load}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
