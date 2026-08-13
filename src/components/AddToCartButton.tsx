"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import QuantityStepper from "@/components/QuantityStepper";

export default function AddToCartButton({
  product,
}: {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    shopId: string;
    shopName: string;
    stock: number;
  };
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (product.stock <= 0) {
    return (
      <button disabled className="rounded-lg bg-neutral-200 px-6 py-3 text-neutral-500 cursor-not-allowed">
        Hết hàng
      </button>
    );
  }

  function addToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        imageUrl: product.imageUrl,
        shopId: product.shopId,
        shopName: product.shopName,
      },
      qty
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-500">Số lượng</span>
        <QuantityStepper value={qty} onChange={setQty} min={1} max={product.stock} />
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
    </div>
  );
}
