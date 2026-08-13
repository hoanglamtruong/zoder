"use client";

import { useState } from "react";
import { formatVND } from "@/lib/format";

type Variant = { id: string; name: string; price: string; stock: number };

const emptyForm = { name: "", price: "", stock: "" };

export default function ProductVariantsEditor({
  productId,
  variants,
  onChanged,
}: {
  productId: string;
  variants: Variant[];
  onChanged: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        stock: Number(form.stock || 0),
      }),
    });
    if (!res.ok) {
      setError("Không thêm được biến thể (tên có thể đã tồn tại)");
      return;
    }
    setForm(emptyForm);
    onChanged();
  }

  async function handleUpdate(variantId: string, patch: Partial<{ price: number; stock: number }>) {
    await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChanged();
  }

  async function handleDelete(variantId: string) {
    if (!confirm("Xóa biến thể này?")) return;
    await fetch(`/api/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        Biến thể / Phân loại
      </p>

      {variants.length === 0 ? (
        <p className="text-sm text-neutral-400">
          Chưa có biến thể — sản phẩm dùng giá &amp; tồn kho mặc định.
        </p>
      ) : (
        <div className="space-y-2">
          {variants.map((v) => (
            <div key={v.id} className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 px-3 py-2">
              <span className="flex-1 text-sm font-medium">{v.name}</span>
              <input
                type="number"
                min={0}
                step="1000"
                defaultValue={v.price}
                onBlur={(e) => {
                  const next = Number(e.target.value);
                  if (next > 0 && next !== Number(v.price)) handleUpdate(v.id, { price: next });
                }}
                className="w-28 rounded border border-neutral-300 px-2 py-1 text-sm text-right"
              />
              <input
                type="number"
                min={0}
                defaultValue={v.stock}
                onBlur={(e) => {
                  const next = Number(e.target.value);
                  if (next >= 0 && next !== v.stock) handleUpdate(v.id, { stock: next });
                }}
                className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm text-right"
              />
              <button
                onClick={() => handleDelete(v.id)}
                className="text-red-500 hover:underline text-sm"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          required
          placeholder="Tên biến thể (vd: Size M)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <input
          required
          type="number"
          min={0}
          step="1000"
          placeholder="Giá"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-28 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <input
          required
          type="number"
          min={0}
          placeholder="Tồn kho"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="w-20 rounded border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button type="submit" className="rounded bg-brand text-white px-3 py-1.5 text-sm font-medium hover:bg-brand-dark transition-colors">
          Thêm
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {variants.length > 0 && (
        <p className="text-xs text-neutral-400">
          Khoảng giá hiện tại: {formatVND(Math.min(...variants.map((v) => Number(v.price))))} –{" "}
          {formatVND(Math.max(...variants.map((v) => Number(v.price))))}
        </p>
      )}
    </div>
  );
}
