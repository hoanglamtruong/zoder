"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import QuantityStepper from "@/components/QuantityStepper";
import { formatVND } from "@/lib/format";

type Variant = { id: string; name: string; price: number; stock: number };

export default function AddToCartButton({
  product,
  basePrice,
  baseStock,
  variants,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    shopId: string;
    shopName: string;
  };
  basePrice: number;
  baseStock: number;
  variants: Variant[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants[0]?.id ?? null
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const activeVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) ?? null,
    [variants, selectedVariantId]
  );

  const price = activeVariant ? activeVariant.price : basePrice;
  const stock = activeVariant ? activeVariant.stock : baseStock;
  const canOrder = variants.length === 0 || activeVariant !== null;

  function addToCart() {
    if (!canOrder) return;
    addItem(
      {
        productId: product.id,
        variantId: activeVariant?.id ?? null,
        variantName: activeVariant?.name ?? null,
        name: product.name,
        slug: product.slug,
        price,
        imageUrl: product.imageUrl,
        shopId: product.shopId,
        shopName: product.shopName,
      },
      qty
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-3xl font-extrabold text-brand">{formatVND(price)}</p>

      {variants.length > 0 && (
        <div>
          <p className="text-sm text-neutral-500 mb-2">Phân loại</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const selected = v.id === selectedVariantId;
              const outOfStock = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={outOfStock}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQty(1);
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "border-brand bg-brand/10 text-brand font-medium"
                      : "border-neutral-300 hover:border-brand"
                  } ${outOfStock ? "opacity-40 cursor-not-allowed line-through" : ""}`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-400">
        {stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}
      </p>

      {stock <= 0 || !canOrder ? (
        <button disabled className="rounded-lg bg-neutral-200 px-6 py-3 text-neutral-500 cursor-not-allowed">
          {canOrder ? "Hết hàng" : "Chọn phân loại"}
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Số lượng</span>
            <QuantityStepper value={qty} onChange={setQty} min={1} max={stock} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                addToCart();
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
              className="rounded-lg border-2 border-brand text-brand px-6 py-3 font-medium hover:bg-brand/5 transition-colors"
            >
              {added ? "Đã thêm ✓" : "Thêm vào giỏ"}
            </button>
            <button
              onClick={() => {
                addToCart();
                router.push("/cart");
              }}
              className="rounded-lg bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark transition-colors"
            >
              Mua ngay
            </button>
          </div>
        </>
      )}
    </div>
  );
}
