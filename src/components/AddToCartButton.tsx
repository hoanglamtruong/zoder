"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";

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
  const [added, setAdded] = useState(false);
  const router = useRouter();

  if (product.stock <= 0) {
    return (
      <button disabled className="rounded-lg bg-neutral-200 px-6 py-3 text-neutral-500 cursor-not-allowed">
        Hết hàng
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => {
          addItem({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            imageUrl: product.imageUrl,
            shopId: product.shopId,
            shopName: product.shopName,
          });
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="rounded-lg bg-neutral-900 px-6 py-3 text-white hover:bg-neutral-700 transition-colors"
      >
        {added ? "Đã thêm ✓" : "Thêm vào giỏ"}
      </button>
      <button
        onClick={() => {
          addItem({
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            imageUrl: product.imageUrl,
            shopId: product.shopId,
            shopName: product.shopName,
          });
          router.push("/cart");
        }}
        className="rounded-lg border border-neutral-300 px-6 py-3 hover:bg-neutral-100 transition-colors"
      >
        Mua ngay
      </button>
    </div>
  );
}
